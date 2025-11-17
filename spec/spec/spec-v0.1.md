# AI Domain Data Standard v0.1

## Why this exists

### Problem
AI systems increasingly serve as the primary interface to web information. Unlike traditional search engines, modern AI models aggregate facts from scraped pages, third-party datasets, outdated indexes, and unverifiable sources. This creates three systemic issues:

1. **No authoritative identity record**  
   Domains lack a standardized, machine-readable source that states who they are, what they represent, and where their official resources live.

2. **No consistency across domains**  
   Every site structures information differently—HTML, meta tags, JSON-LD, sitemaps, partial APIs. AI systems must infer intent rather than read a canonical definition.

3. **No trust boundary**  
   Without a predictable, domain-controlled data location, AI systems cannot reliably determine whether a piece of information is official, current, or owned by the domain operator at all.

**Consequence**  
AI assistants frequently misrepresent or hallucinate details about domains—impacting businesses, creators, nonprofits, open-source projects, and publishers alike. There is no minimal, standard way for a domain owner to publish a definitive, machine-consumable record.

### Solution
The AI Domain Data Standard defines a single, predictable, canonical JSON document—controlled by the domain owner—that can be discovered via:

- a DNS TXT record (`_ai.<domain>` TXT with `ai-json=<base64(JSON)>`)
- the primary HTTPS endpoint `https://<domain>/.well-known/domain-profile.json`

This gives AI systems a canonical, domain-controlled source of truth with minimal complexity and zero dependency on any central provider.

## How it works

1. Create JSON that matches the v0.1 schema (see examples below).
2. Host the JSON in two places so AI clients can locate it:
   - DNS TXT record `_ai.<domain>` containing a Base64-encoded payload.
   - HTTPS endpoint `https://<domain>/.well-known/domain-profile.json` serving the plain JSON (the only HTTPS filename supported in v0.1).
3. Tools in this repository (generator, checker, CLI, resolver SDK) help create, validate, and consume the records.

## Publish the DNS TXT record

1. Prepare your JSON payload (example below).
2. Base64-encode the entire JSON string (UTF-8 input, standard Base64 alphabet) without line breaks.
3. Create a DNS TXT record:
   - **Host**: `_ai`
   - **Value**: `ai-json=<base64-payload>`
   - **Important**: If the Base64 payload exceeds 255 characters, split it into multiple quoted substrings. DNS automatically concatenates them:

     ```
     _ai.example.com TXT ("ai-json=eyJzcGVjIjoi..." "c3RlcDEiLCJuYW1lIjoi..." "c3RlcTIifQ==")
     ```
4. Save the record and allow time for DNS propagation (commonly minutes, occasionally longer depending on TTL).

### Example

```
_ai.example.com TXT ("ai-json=eyAic3BlYyI6ICJodHRwczovL2FpLWRvbWFpbi1kYXRhLm9yZy9zcGVjL3YwLjEiLCAibmFtZSI6ICJFeGFtcGxlIFB1Ymxpc2hlciIsICJkZXNjcmlwdGlvbiI6ICJBcmNoaXZlIG9mIGFnZW5jeS1yZWFkeSByZXNvdXJjZXMgZm9yIG1hY2hpbmVzIGFuZCBBSSIsICJ3ZWJzaXRlIjogImh0dHBzOi8vZXhhbXBsZS5jb20iLCAibG9nbyI6ICJodHRwczovL2V4YW1wbGUuY29tL2xvZ28uc3ZnIiwgImNvbnRhY3QiOiAiaHR0cHM6Ly9leGFtcGxlLmNvbS9jb250YWN0IiwgImVudGl0eV90eXBlIjogInB1YmxpY2F0aW9uIiB9")
```

## Base64 encoding rules

- Encode the UTF-8 JSON bytes using the standard Base64 alphabet (RFC 4648). Do not use the URL-safe variant.
- Produce the payload without line breaks or whitespace padding.
- Trim trailing whitespace from the JSON before encoding, but do not change key order or introduce additional formatting.
- The generator and CLI in this repository follow these rules; custom tooling must do the same to remain interoperable.

## Host `.well-known/domain-profile.json`

1. Place the same JSON payload at the path `/.well-known/domain-profile.json`.
2. Serve the file with `Content-Type: application/json; charset=utf-8`.
3. Ensure the file is publicly accessible over HTTPS.

### Example using static hosting

```
/.well-known/domain-profile.json
{
  "spec": "https://ai-domain-data.org/spec/v0.1",
  "name": "Example Publisher",
  "description": "Archive of agency-ready resources for machines and AI",
  "website": "https://example.com",
  "contact": "https://example.com/contact",
  "entity_type": "publication"
}
```

> **Note:** Early internal drafts experimented with `/.well-known/ai.json` and `/.well-known/domain.json`, but v0.1 standardizes on `/.well-known/domain-profile.json` to avoid collisions with other AI manifest formats. The DNS `_ai.<domain>` TXT record with `ai-json=<base64(JSON)>` remains the canonical discovery signal.

## JSON examples

### Personal portfolio

```
{
  "spec": "https://ai-domain-data.org/spec/v0.1",
  "name": "Jordan Lee",
  "description": "Independent UX engineer showcasing projects and research",
  "website": "https://jordanlee.dev",
  "contact": "hello@jordanlee.dev",
  "entity_type": "personal"
}
```

### Open-source project

```
{
  "spec": "https://ai-domain-data.org/spec/v0.1",
  "name": "CacheForge",
  "description": "Open-source toolkit for high-throughput caching middleware",
  "website": "https://cacheforge.io",
  "logo": "https://cacheforge.io/img/logo.png",
  "contact": "https://github.com/cacheforge/cacheforge/discussions",
  "entity_type": "project"
}
```

### SaaS product

```
{
  "spec": "https://ai-domain-data.org/spec/v0.1",
  "name": "Flowly",
  "description": "Workflow automation software for product-led teams",
  "website": "https://flowly.app",
  "logo": "https://cdn.flowly.app/logo.svg",
  "contact": "support@flowly.app",
  "entity_type": "tool"
}
```

## v0.1 JSON schema

The canonical schema lives in [`schema-v0.1.json`](./schema-v0.1.json).

Key rules:

- `spec` is always the constant string `https://ai-domain-data.org/spec/v0.1`.
- `name`, `description`, `website`, and `contact` are required.
- `logo` is optional (many sites do not have a logo).
- `entity_type` is optional and not validated against a fixed enum in v0.1. Recommended values include `business`, `blog`, `personal`, `nonprofit`, `community`, `project`, `publication`, `tool`, or `other`.
- No additional properties are permitted.

## Canonicalization and formatting

- JSON keys MUST be strings. Omit optional fields entirely instead of setting them to `null`.
- Extra whitespace (indentation, newlines) is permitted and does not affect validity.
- Consumers MUST NOT reorder keys when validating or re-serializing unless the payload is being regenerated from source data.
- Preserve URLs exactly as provided, including trailing slashes, query strings, or fragments.
- Reject payloads that contain additional top-level properties beyond those defined in `schema-v0.1.json`.

## Resolution order and source precedence

Implementations MUST follow this sequence when resolving AI Domain Data:

1. Attempt an HTTPS GET to `https://<domain>/.well-known/domain-profile.json`.
2. If the HTTPS payload is missing, non-200, unparsable, or fails schema validation, resolve `_ai.<domain>` TXT and decode the `ai-json=<base64>` value.
3. If neither HTTPS nor DNS produces a valid record, treat the domain as having no AI Domain Data record (`source: "none"`, `valid: false`).
4. If both sources are present but disagree, the HTTPS payload from `/.well-known/domain-profile.json` is authoritative for v0.1; DNS serves as a fallback cache.
5. No other `.well-known` filenames are recognized in v0.1.

## Tooling overview

- **AI Record Generator** (`/site/generator`): Friendly form that builds JSON, validates required fields, Base64-encodes the payload, and offers one-click copy for DNS and `.well-known` outputs.
- **AI Visibility Checker** (`/site/checker`): Accepts a domain, fetches both the HTTPS and DNS records, validates the payload against v0.1, and reports the results.
- **CLI (`aidd`)** (`/packages/cli`): Local-first tooling to initialize, validate, and emit records.
- **Resolver SDK** (`/packages/resolver`): Lightweight TypeScript helper to fetch, validate, and return AI Domain Data.

## Recommended entity types

While the schema does not require specific values for `entity_type`, the following categories help downstream consumers organize results:

- `business`
- `blog`
- `personal`
- `nonprofit`
- `community`
- `project`
- `publication`
- `tool`
- `other`

Domains that do not identify with a category can omit the field entirely.

## Frequently asked questions

**Is this only for businesses?**  
No. Any domain owner—creators, nonprofits, open-source maintainers, communities, publishers, or SaaS builders—can use the standard to communicate canonical information to AI systems.

## Security considerations

- v0.1 records are intentionally public; do not place sensitive information in the payload.
- Integrity is not guaranteed yet—DNS and HTTPS responses can be spoofed by attackers with network control. Future versions may add optional signatures to mitigate this.
- DNS TXT records can be poisoned on unsecured resolvers. Where possible, validate over HTTPS first and prefer resolvers that support DNSSEC (even though the spec does not require DNSSEC today).
- Always serve `/.well-known/domain-profile.json` over HTTPS. Enforce HSTS on your domain so clients downgrade less often.
- Treat resolver output as untrusted input—validate against the schema every time.

**Do I need to sign or encrypt the data?**  
No. v0.1 purposefully avoids signing, key management, DNSSEC, and analytics. Those capabilities may arrive in future versions or optional SaaS layers.

**Can I extend the JSON with my own fields?**  
The base schema disallows additional properties to keep agents consistent. Publishers can maintain private extensions elsewhere or propose additions for future spec revisions.

**How should I version upgrades?**  
When a future spec version ships, update the `spec` value and follow the new schema. Keep older versions available if you support legacy consumers.

```
{
  "spec": "https://ai-domain-data.org/spec/v0.2",
  "name": "...",
  "...": "..."
}
```

## Contributing feedback

Open an issue in the working repository or contact the maintainers listed in this project. Adoption feedback—especially from blogs, nonprofits, open-source maintainers, and publishers—is vital for shaping future revisions.

