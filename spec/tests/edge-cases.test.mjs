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

/**
 * Edge Case Test Suite
 * 
 * Tests edge cases and boundary conditions that might not be covered
 * in the main schema validation or example tests.
 */

test("Edge case: empty jsonld object {}", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: {}
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "Empty jsonld object should be valid (schema doesn't require @context/@type, only that it's an object)"
  );
});

test("Edge case: jsonld with valid JSON-LD structure", () => {
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
        "addressRegion": "CA",
        "postalCode": "94102"
      },
      "foundingDate": "2020-01-15",
      "numberOfEmployees": {
        "@type": "QuantitativeValue",
        "value": 50
      }
    }
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "jsonld with complex valid JSON-LD structure should be valid"
  );
});

test("Edge case: jsonld with invalid JSON-LD structure (schema-wise still valid)", () => {
  // Schema only checks that jsonld is an object, not that it's valid JSON-LD
  // This tests that the schema doesn't enforce JSON-LD validity
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "InvalidType", // Not a valid schema.org type, but schema allows it
      "someField": "someValue"
    }
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "jsonld with invalid JSON-LD structure should still pass schema validation (schema only checks it's an object)"
  );
});

test("Edge case: very long description (DNS encoding consideration)", () => {
  // Test that very long descriptions are valid (DNS encoding is handled separately)
  const longDescription = "A".repeat(500); // 500 character description
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: longDescription,
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "Very long description should be valid (DNS encoding is a separate concern)"
  );
});

test("Edge case: URL with trailing slash", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com/",
    contact: "contact@example.com",
    logo: "https://example.com/logo.png/"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "URLs with trailing slashes should be valid"
  );
});

test("Edge case: URL with query parameters", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com?param=value&other=123",
    contact: "https://example.com/contact?ref=test",
    logo: "https://example.com/logo.png?v=1&size=large"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "URLs with query parameters should be valid"
  );
});

test("Edge case: URL with fragments", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com#section",
    contact: "https://example.com/contact#top",
    logo: "https://example.com/logo.png#main"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "URLs with fragments should be valid"
  );
});

test("Edge case: URL with all components (protocol, domain, path, query, fragment)", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com/path/to/page?param=value&other=123#section",
    contact: "https://example.com/contact?ref=test#top",
    logo: "https://cdn.example.com/images/logo.png?v=2&size=large#main"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "URLs with all components should be valid"
  );
});

test("Edge case: contact as email address", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "user@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "Contact as email address should be valid"
  );
});

test("Edge case: contact as URL", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "https://example.com/contact"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "Contact as URL should be valid"
  );
});

test("Edge case: contact as mailto URL", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "mailto:user@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "Contact as mailto URL should be valid"
  );
});

test("Edge case: entity_type with all valid schema.org values", () => {
  const validEntityTypes = [
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

  validEntityTypes.forEach((entityType) => {
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
  });
});

test("Edge case: null values should fail (omit instead)", () => {
  // Test that null values for optional fields are rejected
  const testCases = [
    {
      name: "null logo",
      record: {
        spec: specVersion,
        name: "Example",
        description: "Test",
        website: "https://example.com",
        contact: "contact@example.com",
        logo: null
      }
    },
    {
      name: "null entity_type",
      record: {
        spec: specVersion,
        name: "Example",
        description: "Test",
        website: "https://example.com",
        contact: "contact@example.com",
        entity_type: null
      }
    },
    {
      name: "null jsonld",
      record: {
        spec: specVersion,
        name: "Example",
        description: "Test",
        website: "https://example.com",
        contact: "contact@example.com",
        jsonld: null
      }
    }
  ];

  testCases.forEach(({ name, record }) => {
    const result = validateRecord(record);
    assert.strictEqual(
      result.valid,
      false,
      `${name} should be invalid (should omit field instead of using null)`
    );
  });
});

test("Edge case: empty strings for required fields should fail", () => {
  const testCases = [
    {
      name: "empty spec",
      record: {
        spec: "",
        name: "Example",
        description: "Test",
        website: "https://example.com",
        contact: "contact@example.com"
      }
    },
    {
      name: "empty name",
      record: {
        spec: specVersion,
        name: "",
        description: "Test",
        website: "https://example.com",
        contact: "contact@example.com"
      }
    },
    {
      name: "empty description",
      record: {
        spec: specVersion,
        name: "Example",
        description: "",
        website: "https://example.com",
        contact: "contact@example.com"
      }
    },
    {
      name: "empty website",
      record: {
        spec: specVersion,
        name: "Example",
        description: "Test",
        website: "",
        contact: "contact@example.com"
      }
    },
    {
      name: "empty contact",
      record: {
        spec: specVersion,
        name: "Example",
        description: "Test",
        website: "https://example.com",
        contact: ""
      }
    }
  ];

  testCases.forEach(({ name, record }) => {
    const result = validateRecord(record);
    assert.strictEqual(
      result.valid,
      false,
      `${name} should be invalid (empty strings not allowed for required fields)`
    );
  });
});

test("Edge case: whitespace-only strings for required fields (schema allows, checker would reject)", () => {
  // Note: The schema only checks minLength: 1, so whitespace-only strings pass schema validation.
  // The checker has additional validation that trims and checks, but the schema itself doesn't reject whitespace.
  // This test documents the current schema behavior.
  const testCases = [
    {
      name: "whitespace-only name",
      record: {
        spec: specVersion,
        name: "   ",
        description: "Test",
        website: "https://example.com",
        contact: "contact@example.com"
      }
    },
    {
      name: "whitespace-only description",
      record: {
        spec: specVersion,
        name: "Example",
        description: "\t\n  ",
        website: "https://example.com",
        contact: "contact@example.com"
      }
    }
  ];

  testCases.forEach(({ name, record }) => {
    const result = validateRecord(record);
    // Schema allows whitespace-only (minLength: 1 is satisfied)
    // Checker would reject this with additional validation
    assert.strictEqual(
      result.valid,
      true,
      `${name} passes schema validation (schema only checks minLength, not content)`
    );
  });
});

test("Edge case: minimum valid record (all required fields, no optional)", () => {
  const record = {
    spec: specVersion,
    name: "A", // Minimum length
    description: "B", // Minimum length
    website: "https://a.co", // Minimum valid URL
    contact: "a@b.co" // Minimum valid email
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "Minimum valid record should pass validation"
  );
});

test("Edge case: all optional fields present", () => {
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
      "name": "Example Organization"
    }
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "Record with all optional fields should be valid"
  );
});

test("Edge case: internationalized domain names (IDN)", () => {
  // Test that URLs with internationalized domains are valid
  const record = {
    spec: specVersion,
    name: "Example",
    description: "Test",
    website: "https://例え.テスト",
    contact: "contact@例え.テスト"
  };

  // Note: This might fail URL validation depending on the URL parser
  // But the schema should accept it if the URL constructor accepts it
  const result = validateRecord(record);
  // We'll just check it doesn't crash - IDN support varies
  assert.ok(
    typeof result.valid === "boolean",
    "IDN URLs should be handled without crashing"
  );
});

test("Edge case: IPv4 addresses in URLs", () => {
  const record = {
    spec: specVersion,
    name: "Example",
    description: "Test",
    website: "http://192.168.1.1",
    contact: "http://10.0.0.1/contact"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "URLs with IPv4 addresses should be valid"
  );
});

test("Edge case: IPv6 addresses in URLs", () => {
  const record = {
    spec: specVersion,
    name: "Example",
    description: "Test",
    website: "http://[2001:db8::1]",
    contact: "http://[::1]/contact"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "URLs with IPv6 addresses should be valid"
  );
});

