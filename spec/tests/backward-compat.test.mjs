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
 * Backward Compatibility Test Suite
 * 
 * This suite ensures that v0.1 records (created before the jsonld field was added)
 * continue to validate correctly against the updated schema. The schema maintains
 * backward compatibility by making jsonld an optional field.
 * 
 * Backward Compatibility Guarantee:
 * - All v0.1 records (without jsonld) must continue to validate
 * - Records with optional fields (logo, entity_type) must continue to validate
 * - Records without any optional fields must continue to validate
 * - The schema must accept records without jsonld
 * - The schema must reject records with invalid jsonld type (to prevent confusion)
 */

test("v0.1 minimal record (no optional fields) - backward compatible", () => {
  // This represents the absolute minimum v0.1 record
  const v01Minimal = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(v01Minimal);
  assert.strictEqual(
    result.valid,
    true,
    `v0.1 minimal record should validate. Errors: ${JSON.stringify(result.errors)}`
  );
  assert.ok(
    !v01Minimal.hasOwnProperty("logo"),
    "v0.1 minimal record correctly omits logo"
  );
  assert.ok(
    !v01Minimal.hasOwnProperty("entity_type"),
    "v0.1 minimal record correctly omits entity_type"
  );
  assert.ok(
    !v01Minimal.hasOwnProperty("jsonld"),
    "v0.1 minimal record correctly omits jsonld"
  );
});

test("v0.1 record with logo field - backward compatible", () => {
  // v0.1 records that included the optional logo field
  const v01WithLogo = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    logo: "https://example.com/logo.png"
  };

  const result = validateRecord(v01WithLogo);
  assert.strictEqual(
    result.valid,
    true,
    `v0.1 record with logo should validate. Errors: ${JSON.stringify(result.errors)}`
  );
  assert.ok(
    v01WithLogo.logo,
    "v0.1 record includes logo field"
  );
  assert.ok(
    !v01WithLogo.hasOwnProperty("jsonld"),
    "v0.1 record correctly omits jsonld"
  );
});

test("v0.1 record with entity_type field - backward compatible", () => {
  // v0.1 records that included the optional entity_type field
  const v01WithEntityType = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    entity_type: "Organization"
  };

  const result = validateRecord(v01WithEntityType);
  assert.strictEqual(
    result.valid,
    true,
    `v0.1 record with entity_type should validate. Errors: ${JSON.stringify(result.errors)}`
  );
  assert.ok(
    v01WithEntityType.entity_type,
    "v0.1 record includes entity_type field"
  );
  assert.ok(
    !v01WithEntityType.hasOwnProperty("jsonld"),
    "v0.1 record correctly omits jsonld"
  );
});

test("v0.1 record with all optional fields (logo + entity_type) - backward compatible", () => {
  // v0.1 records that included both optional fields
  const v01Complete = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    logo: "https://example.com/logo.png",
    entity_type: "Organization"
  };

  const result = validateRecord(v01Complete);
  assert.strictEqual(
    result.valid,
    true,
    `v0.1 record with all optional fields should validate. Errors: ${JSON.stringify(result.errors)}`
  );
  assert.ok(
    v01Complete.logo,
    "v0.1 record includes logo field"
  );
  assert.ok(
    v01Complete.entity_type,
    "v0.1 record includes entity_type field"
  );
  assert.ok(
    !v01Complete.hasOwnProperty("jsonld"),
    "v0.1 record correctly omits jsonld"
  );
});

test("Schema accepts records without jsonld field", () => {
  // Verify that omitting jsonld is explicitly allowed
  const recordWithoutJsonld = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(recordWithoutJsonld);
  assert.strictEqual(
    result.valid,
    true,
    "Schema must accept records without jsonld field"
  );
  assert.ok(
    !recordWithoutJsonld.hasOwnProperty("jsonld"),
    "Record correctly omits jsonld field"
  );
});

test("Schema rejects records with invalid jsonld type (string)", () => {
  // Invalid: jsonld must be an object, not a string
  const recordWithInvalidJsonldString = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: "not an object"
  };

  const result = validateRecord(recordWithInvalidJsonldString);
  assert.strictEqual(
    result.valid,
    false,
    "Schema must reject jsonld when it's a string instead of object"
  );
});

test("Schema rejects records with invalid jsonld type (array)", () => {
  // Invalid: jsonld must be an object, not an array
  const recordWithInvalidJsonldArray = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: []
  };

  const result = validateRecord(recordWithInvalidJsonldArray);
  assert.strictEqual(
    result.valid,
    false,
    "Schema must reject jsonld when it's an array instead of object"
  );
});

test("Schema rejects records with invalid jsonld type (null)", () => {
  // Invalid: jsonld must be an object, not null
  const recordWithInvalidJsonldNull = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
    jsonld: null
  };

  const result = validateRecord(recordWithInvalidJsonldNull);
  assert.strictEqual(
    result.valid,
    false,
    "Schema must reject jsonld when it's null instead of object"
  );
});

test("Backward compatibility: v0.1 records with various entity_type values", () => {
  // Test that v0.1 records with different entity_type values still validate
  const entityTypes = [
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

  entityTypes.forEach((entityType) => {
    const v01Record = {
      spec: specVersion,
      name: "Example",
      description: "Test",
      website: "https://example.com",
      contact: "contact@example.com",
      entity_type: entityType
    };

    const result = validateRecord(v01Record);
    assert.strictEqual(
      result.valid,
      true,
      `v0.1 record with entity_type "${entityType}" should validate`
    );
    assert.ok(
      !v01Record.hasOwnProperty("jsonld"),
      `v0.1 record with entity_type "${entityType}" correctly omits jsonld`
    );
  });
});

test("Backward compatibility: v0.1 records with contact as email", () => {
  // v0.1 records commonly used email addresses for contact
  const v01WithEmail = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(v01WithEmail);
  assert.strictEqual(
    result.valid,
    true,
    "v0.1 record with email contact should validate"
  );
  assert.ok(
    !v01WithEmail.hasOwnProperty("jsonld"),
    "v0.1 record correctly omits jsonld"
  );
});

test("Backward compatibility: v0.1 records with contact as URL", () => {
  // v0.1 records could also use URLs for contact
  const v01WithUrlContact = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "https://example.com/contact"
  };

  const result = validateRecord(v01WithUrlContact);
  assert.strictEqual(
    result.valid,
    true,
    "v0.1 record with URL contact should validate"
  );
  assert.ok(
    !v01WithUrlContact.hasOwnProperty("jsonld"),
    "v0.1 record correctly omits jsonld"
  );
});

test("Backward compatibility guarantee: All v0.1 field combinations", () => {
  // Test all possible combinations of optional fields in v0.1
  const combinations = [
    // No optional fields
    {
      spec: specVersion,
      name: "Example",
      description: "Test",
      website: "https://example.com",
      contact: "contact@example.com"
    },
    // Only logo
    {
      spec: specVersion,
      name: "Example",
      description: "Test",
      website: "https://example.com",
      contact: "contact@example.com",
      logo: "https://example.com/logo.png"
    },
    // Only entity_type
    {
      spec: specVersion,
      name: "Example",
      description: "Test",
      website: "https://example.com",
      contact: "contact@example.com",
      entity_type: "Organization"
    },
    // logo + entity_type
    {
      spec: specVersion,
      name: "Example",
      description: "Test",
      website: "https://example.com",
      contact: "contact@example.com",
      logo: "https://example.com/logo.png",
      entity_type: "Organization"
    }
  ];

  combinations.forEach((record, index) => {
    const result = validateRecord(record);
    assert.strictEqual(
      result.valid,
      true,
      `v0.1 field combination ${index + 1} should validate. Errors: ${JSON.stringify(result.errors)}`
    );
    assert.ok(
      !record.hasOwnProperty("jsonld"),
      `v0.1 field combination ${index + 1} correctly omits jsonld`
    );
  });
});

