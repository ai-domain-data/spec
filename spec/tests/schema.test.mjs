import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));
const schemaPath = resolve(__dirname, "..", "spec", "schema-v0.1.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const specVersion = "https://ai-domain-data.org/spec/v0.1";

// Helper function to validate and return result
function validateRecord(record) {
  const valid = validate(record);
  return {
    valid,
    errors: validate.errors || []
  };
}

test("Valid minimal record (required fields only)", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Minimal record should be valid");
  assert.strictEqual(result.errors.length, 0, "Should have no errors");
});

test("Valid record with optional logo field", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    logo: "https://example.com/logo.png"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Record with logo should be valid");
});

test("Valid record with optional entity_type field", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    entity_type: "Organization"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Record with entity_type should be valid");
});

test("Valid record with jsonld field", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Example Organization",
      "url": "https://example.com"
    }
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Record with jsonld should be valid");
});

test("Valid complete record (all optional fields)", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    logo: "https://example.com/logo.png",
    entity_type: "Organization",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Example Organization",
      "url": "https://example.com",
      "description": "A test organization"
    }
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Complete record should be valid");
});

test("Invalid: missing required field 'spec'", () => {
  const record = {
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "Missing spec should be invalid");
  assert(result.errors.length > 0, "Should have validation errors");
});

test("Invalid: missing required field 'name'", () => {
  const record = {
    spec: specVersion,
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "Missing name should be invalid");
});

test("Invalid: missing required field 'description'", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "Missing description should be invalid");
});

test("Invalid: missing required field 'website'", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "Missing website should be invalid");
});

test("Invalid: missing required field 'contact'", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "Missing contact should be invalid");
});

test("Invalid: wrong spec value", () => {
  const record = {
    spec: "https://ai-domain-data.org/spec/v0.2",
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "Wrong spec version should be invalid");
});

test("Invalid: name is not a string", () => {
  const record = {
    spec: specVersion,
    name: 123,
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "name must be a string");
});

test("Invalid: name is empty string", () => {
  const record = {
    spec: specVersion,
    name: "",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "name must have minLength 1");
});

test("Invalid: description is empty string", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "description must have minLength 1");
});

test("Invalid: website is not a valid URI", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "not-a-url",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "website must be a valid URI");
});

test("Invalid: logo is not a valid URI", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    logo: "not-a-url"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "logo must be a valid URI when provided");
});

test("Invalid: entity_type is not a string", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    entity_type: 123
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "entity_type must be a string when provided");
});

test("Invalid: entity_type is not a valid schema.org value", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    entity_type: "business" // Old value, not a valid schema.org @type
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    false,
    "entity_type must be a valid schema.org @type value (e.g., Organization, Person, not 'business')"
  );
});

test("Invalid: jsonld is a string instead of object", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: "not an object"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "jsonld must be an object when provided");
});

test("Invalid: jsonld is an array instead of object", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: []
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "jsonld must be an object, not an array");
});

test("Invalid: jsonld is null", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: null
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "jsonld must be an object, not null");
});

test("Invalid: additional properties not allowed", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    extraField: "not allowed"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, false, "Additional properties should be rejected");
});

test("Backward compatibility: record without jsonld field", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Records without jsonld should still be valid");
});

test("Backward compatibility: record without logo field", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Records without logo should still be valid");
});

test("Backward compatibility: record without entity_type field", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Records without entity_type should still be valid");
});

test("Valid: empty jsonld object (edge case)", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: {}
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Empty jsonld object should be valid (schema only checks type)");
});

test("Valid: entity_type with schema.org values", () => {
  const schemaOrgTypes = [
    "Organization",
    "Person",
    "Blog",
    "NGO",
    "Community",
    "Project",
    "CreativeWork",
    "SoftwareApplication",
    "Thing"
  ];

  for (const entityType of schemaOrgTypes) {
    const record = {
      spec: specVersion,
      name: "Example",
      description: "Test",
      website: "https://example.com",
      contact: "contact@example.com",
      entity_type: entityType
    };

    const result = validateRecord(record);
    assert.strictEqual(
      result.valid,
      true,
      `entity_type "${entityType}" should be valid`
    );
  }
});

test("Valid: contact as email address", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Contact as email should be valid");
});

test("Valid: contact as URL", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "https://example.com/contact"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Contact as URL should be valid");
});

test("Valid: jsonld with complex nested structure", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Example Organization",
      "url": "https://example.com",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "San Francisco",
        "addressRegion": "CA"
      },
      "foundingDate": "2020-01-15"
    }
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Complex jsonld structure should be valid");
});

// Test examples from spec-v0.1.md
test("Example from spec: Personal portfolio", () => {
  const record = {
    spec: specVersion,
    name: "Jordan Lee",
    description: "Independent UX engineer showcasing projects and research",
    website: "https://jordanlee.dev",
    contact: "hello@jordanlee.dev",
    entity_type: "Person"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Personal portfolio example should validate");
});

test("Example from spec: Open-source project", () => {
  const record = {
    spec: specVersion,
    name: "CacheForge",
    description: "Open-source toolkit for high-throughput caching middleware",
    website: "https://cacheforge.io",
    logo: "https://cacheforge.io/img/logo.png",
    contact: "https://github.com/cacheforge/cacheforge/discussions",
    entity_type: "Project"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Open-source project example should validate");
});

test("Example from spec: SaaS product", () => {
  const record = {
    spec: specVersion,
    name: "Flowly",
    description: "Workflow automation software for product-led teams",
    website: "https://flowly.app",
    logo: "https://cdn.flowly.app/logo.svg",
    contact: "support@flowly.app",
    entity_type: "SoftwareApplication"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "SaaS product example should validate");
});

test("Example from spec: Organization with embedded JSON-LD", () => {
  const record = {
    spec: specVersion,
    name: "Ascending Web Services",
    description: "Veteran-owned web development, hosting & support company delivering fast, secure, SEO-optimized websites for service-based businesses",
    website: "https://ascendingwebservices.com",
    logo: "https://ascendingwebservices.com/favicon.ico",
    contact: "info@ascendingwebservices.com",
    entity_type: "Organization",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Ascending Web Services",
      "url": "https://ascendingwebservices.com",
      "logo": "https://ascendingwebservices.com/favicon.ico",
      "email": "info@ascendingwebservices.com",
      "description": "Veteran-owned web development, hosting & support company delivering fast, secure, SEO-optimized websites for service-based businesses",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Davenport",
        "addressRegion": "FL"
      }
    }
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Organization with JSON-LD example should validate");
});

test("Example from spec: Static hosting example", () => {
  const record = {
    spec: specVersion,
    name: "Example Publisher",
    description: "Archive of agency-ready resources for machines and AI",
    website: "https://example.com",
    contact: "https://example.com/contact",
    entity_type: "CreativeWork"
  };

  const result = validateRecord(record);
  assert.strictEqual(result.valid, true, "Static hosting example should validate");
});

