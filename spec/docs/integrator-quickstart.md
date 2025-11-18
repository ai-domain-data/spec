# Integrator Quickstart — AI Domain Data Standard

This guide is for plugin authors, CMS developers, and platform builders who want to add one-click support for `domain-profile.json` to their products. It focuses on practical implementation details and common integration patterns.

---

## Required Fields & Suggested Defaults

The AIDD record requires four fields. Map them from your CMS/platform data:

| AIDD Field | Suggested CMS Source | Notes |
|------------|---------------------|-------|
| `spec` | **Constant:** `"https://ai-domain-data.org/spec/v0.1"` | Always use this exact string |
| `name` | Site name, blog name, or organization name | Use the canonical public-facing name |
| `description` | Site tagline, meta description, or "About" excerpt | 1–2 sentences, avoid marketing fluff |
| `website` | Site URL (homepage) | Canonical HTTPS URL, no trailing slash unless your CMS uses it |
| `contact` | Admin email, contact form URL, or support email | Email address or HTTPS URL |

**Example mapping (WordPress):**
```php
$record = [
  'spec' => 'https://ai-domain-data.org/spec/v0.1',
  'name' => get_bloginfo('name'),
  'description' => get_bloginfo('description') ?: get_bloginfo('name') . ' – ' . get_bloginfo('url'),
  'website' => home_url('/'),
  'contact' => get_option('admin_email')
];
```

---

## Optional Fields & Safe Defaults

All optional fields should be **omitted entirely** when unused (do not set to `null` or empty strings).

| AIDD Field | Suggested CMS Source | Safe Default |
|------------|---------------------|--------------|
| `logo` | Site icon, custom logo, or theme logo URL | Omit if no logo exists |
| `entity_type` | User selection or auto-detect from content type | Omit if unknown; see valid values below |
| `jsonld` | Existing schema.org JSON-LD block (if present) | Omit if not using JSON-LD |

**Valid `entity_type` values** (must match schema.org `@type` exactly):
- `Organization` — Businesses, companies, nonprofits
- `Person` — Personal blogs, portfolios
- `Blog` — Blog-focused sites
- `NGO` — Non-governmental organizations
- `Community` — Forums, communities
- `Project` — Open-source projects, initiatives
- `CreativeWork` — Publications, media sites
- `SoftwareApplication` — SaaS products, apps
- `Thing` — Generic fallback

**Example with optional fields:**
```php
$record = [
  'spec' => 'https://ai-domain-data.org/spec/v0.1',
  'name' => get_bloginfo('name'),
  'description' => get_bloginfo('description'),
  'website' => home_url('/'),
  'contact' => get_option('admin_email')
];

// Optional: Add logo if available
if ($logo_url = get_site_icon_url()) {
  $record['logo'] = $logo_url;
}

// Optional: Add entity_type if user selected one
if ($entity_type = get_option('aidd_entity_type')) {
  $record['entity_type'] = $entity_type; // Must be valid schema.org @type
}
```

---

## Error Handling & Validation

### What to do if the record can't be written

1. **File write failures** (`.well-known/domain-profile.json`):
   - Log the error for debugging
   - Show a user-friendly message: "Unable to write domain-profile.json. Please check file permissions."
   - Do not silently fail—users need to know their record isn't published

2. **DNS TXT record failures**:
   - This is optional, so failures are acceptable
   - Log for debugging but don't block the feature
   - Consider showing a notice: "DNS record not updated. HTTPS endpoint is still available."

### What to do if user input is invalid

1. **Validate before writing**:
   - Use the canonical schema: `https://ai-domain-data.org/spec/schema-v0.1.json`
   - Reject records with missing required fields
   - Reject records with invalid `entity_type` values (must be valid schema.org `@type`)
   - Reject records with invalid URLs (website, logo, contact)

2. **Show actionable errors**:
   - "Name is required" (not just "Validation failed")
   - "Entity type must be one of: Organization, Person, Blog, NGO, Community, Project, CreativeWork, SoftwareApplication, Thing"
   - "Website must be a valid HTTPS URL"

3. **Prevent invalid data at the UI level**:
   - Use dropdowns for `entity_type` (don't allow free text)
   - Validate URLs in real-time
   - Require non-empty strings for required fields

**Example validation (pseudo-code):**
```javascript
function validateRecord(record) {
  const errors = [];
  
  // Required fields
  if (!record.spec || record.spec !== 'https://ai-domain-data.org/spec/v0.1') {
    errors.push('spec must equal "https://ai-domain-data.org/spec/v0.1"');
  }
  if (!record.name || record.name.trim().length === 0) {
    errors.push('name is required');
  }
  if (!record.description || record.description.trim().length === 0) {
    errors.push('description is required');
  }
  if (!isValidUrl(record.website)) {
    errors.push('website must be a valid HTTPS URL');
  }
  if (!isValidEmailOrUrl(record.contact)) {
    errors.push('contact must be a valid email address or HTTPS URL');
  }
  
  // Optional fields (if present, must be valid)
  if (record.entity_type) {
    const validTypes = ['Organization', 'Person', 'Blog', 'NGO', 'Community', 
                        'Project', 'CreativeWork', 'SoftwareApplication', 'Thing'];
    if (!validTypes.includes(record.entity_type)) {
      errors.push(`entity_type must be one of: ${validTypes.join(', ')}`);
    }
  }
  if (record.logo && !isValidUrl(record.logo)) {
    errors.push('logo must be a valid HTTPS URL');
  }
  if (record.jsonld && typeof record.jsonld !== 'object') {
    errors.push('jsonld must be an object');
  }
  
  return errors;
}
```

---

## Resolution & Precedence Summary

When consuming AIDD records (for display, validation, or analytics), follow this order:

1. **Primary:** Fetch `https://<domain>/.well-known/domain-profile.json` over HTTPS
2. **Fallback:** Query DNS TXT record at `_ai.<domain>` (decode `ai-json=<base64>` value)
3. **If both exist:** HTTPS payload is authoritative; DNS is a fallback cache
4. **If both fail:** Treat domain as having no AIDD record

**Implementation note:** Most plugins only need to **write** the record (not read it). If you're building a consumer tool, see the [Resolver SDK](../implementation-overview.md) for a ready-made implementation.

---

## Versioning Policy

- **v0.1.x releases are backward-compatible:** Existing records continue to validate
- **Breaking changes will use a new spec URL:** e.g., `https://ai-domain-data.org/spec/v0.2` (not `v0.1.2`)
- **The `spec` field in JSON records indicates the version:** Always validate against the schema version specified in the `spec` field

**For integrators:** You can safely target `v0.1` (the spec field value) and support all v0.1.x releases. When v0.2 arrives, it will use a different spec URL, so you can add support incrementally.

---

## Implementation Checklist

- [ ] Map required fields from CMS data (name, description, website, contact)
- [ ] Set `spec` to constant `"https://ai-domain-data.org/spec/v0.1"`
- [ ] Add UI for optional fields (logo, entity_type) with validation
- [ ] Validate record against schema before writing
- [ ] Write to `/.well-known/domain-profile.json` (or equivalent path)
- [ ] Handle file write errors gracefully
- [ ] Show clear validation errors to users
- [ ] Test with minimal record (required fields only)
- [ ] Test with complete record (all optional fields)

---

## Resources

- **Schema:** [`spec/spec/schema-v0.1.json`](../spec/schema-v0.1.json) or `https://ai-domain-data.org/spec/schema-v0.1.json`
- **Examples:** [`spec/examples/basic.json`](../examples/basic.json) (minimal) and [`spec/examples/with-jsonld.json`](../examples/with-jsonld.json) (complete)
- **Full Spec:** [`spec/spec/spec-v0.1.md`](../spec/spec-v0.1.md)
- **Technical Guide:** [`spec/docs/technical-guide-v0.1.md`](./technical-guide-v0.1.md)

---

## Questions?

Open an issue in the [spec repository](https://github.com/ai-domain-data/spec) or reach out to the maintainers. We're here to help make integration as smooth as possible.

