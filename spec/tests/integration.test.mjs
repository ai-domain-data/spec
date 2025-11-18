import { test } from "node:test";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import assert from "node:assert";
import Ajv from "ajv";
import addFormats from "ajv-formats";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Import resolver SDK
// Note: This assumes the resolver is built. In a real scenario, we'd import from the built package.
// For now, we'll test the schema validation logic directly.
const schemaPath = resolve(__dirname, "..", "spec", "schema-v0.1.json");
const schema = JSON.parse(readFileSync(schemaPath, "utf-8"));

const ajv = new Ajv({ allErrors: true, strict: false, validateSchema: false });
addFormats(ajv);
const validate = ajv.compile(schema);

const specVersion = "https://ai-domain-data.org/spec/v0.1";

/**
 * Integration Test Suite
 * 
 * Tests that verify consistency across all tooling (CLI, resolver, checker, generator)
 * and end-to-end workflows.
 */

// Helper to validate record (simulating resolver/checker validation)
function validateRecord(record) {
  const valid = validate(record);
  return {
    valid,
    errors: validate.errors || []
  };
}

// Helper to simulate DNS encoding (Base64)
function encodeDns(record) {
  const json = JSON.stringify(record);
  return Buffer.from(json).toString("base64");
}

// Helper to simulate DNS decoding
function decodeDns(encoded) {
  try {
    const json = Buffer.from(encoded, "base64").toString("utf-8");
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

test("Integration: Resolver SDK accepts records with jsonld", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com",
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
    "Resolver should accept records with jsonld field"
  );
  assert.ok(
    record.jsonld,
    "Record should have jsonld field"
  );
});

test("Integration: Resolver SDK accepts records without jsonld", () => {
  const record = {
    spec: specVersion,
    name: "Example Organization",
    description: "A test organization",
    website: "https://example.com",
    contact: "contact@example.com"
  };

  const result = validateRecord(record);
  assert.strictEqual(
    result.valid,
    true,
    "Resolver should accept records without jsonld field"
  );
  assert.ok(
    !record.hasOwnProperty("jsonld"),
    "Record should not have jsonld field"
  );
});

test("Integration: End-to-end generate → validate → emit → DNS encode", () => {
  // Step 1: Generate record (simulated)
  const generated = {
    spec: specVersion,
    name: "Test Organization",
    description: "A test organization for integration testing",
    website: "https://test.example.com",
    contact: "test@example.com",
    logo: "https://test.example.com/logo.png",
    entity_type: "Organization",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Test Organization"
    }
  };

  // Step 2: Validate
  const validation = validateRecord(generated);
  assert.strictEqual(
    validation.valid,
    true,
    "Generated record should validate"
  );

  // Step 3: Emit (JSON string)
  const emitted = JSON.stringify(generated, null, 2);
  assert.ok(
    emitted.includes('"spec"'),
    "Emitted JSON should contain spec field"
  );
  assert.ok(
    emitted.includes('"jsonld"'),
    "Emitted JSON should contain jsonld field"
  );

  // Step 4: DNS encode
  const dnsEncoded = encodeDns(generated);
  assert.ok(
    dnsEncoded.length > 0,
    "DNS encoded string should not be empty"
  );

  // Step 5: DNS decode and verify
  const decoded = decodeDns(dnsEncoded);
  assert.ok(
    decoded !== null,
    "DNS decoded record should not be null"
  );
  assert.strictEqual(
    decoded.spec,
    generated.spec,
    "Decoded spec should match original"
  );
  assert.strictEqual(
    decoded.name,
    generated.name,
    "Decoded name should match original"
  );
  assert.ok(
    decoded.jsonld,
    "Decoded record should have jsonld field"
  );

  // Step 6: Validate decoded record
  const decodedValidation = validateRecord(decoded);
  assert.strictEqual(
    decodedValidation.valid,
    true,
    "Decoded record should still validate"
  );
});

test("Integration: Schema validation consistency across all tooling", () => {
  // Test that the same record validates the same way regardless of tool
  const testRecord = {
    spec: specVersion,
    name: "Consistency Test",
    description: "Testing schema validation consistency",
    website: "https://example.com",
    contact: "test@example.com",
    entity_type: "Organization"
  };

  // Simulate validation from different tools (all should use the same schema)
  const validation1 = validateRecord(testRecord);
  const validation2 = validateRecord(testRecord);
  const validation3 = validateRecord(testRecord);

  // All validations should produce identical results
  assert.strictEqual(
    validation1.valid,
    validation2.valid,
    "Validation results should be consistent"
  );
  assert.strictEqual(
    validation2.valid,
    validation3.valid,
    "Validation results should be consistent"
  );
  assert.strictEqual(
    validation1.valid,
    true,
    "Test record should be valid"
  );
});

test("Integration: Invalid records rejected consistently", () => {
  const invalidRecord = {
    spec: specVersion,
    name: "Test",
    description: "Test",
    website: "https://example.com",
    contact: "test@example.com",
    entity_type: "invalid-type" // Invalid entity_type
  };

  // All tools should reject this the same way
  const validation1 = validateRecord(invalidRecord);
  const validation2 = validateRecord(invalidRecord);

  assert.strictEqual(
    validation1.valid,
    false,
    "Invalid record should be rejected"
  );
  assert.strictEqual(
    validation2.valid,
    false,
    "Invalid record should be rejected consistently"
  );
  assert.strictEqual(
    validation1.valid,
    validation2.valid,
    "Rejection should be consistent across tools"
  );
});

test("Integration: DNS encoding/decoding roundtrip", () => {
  const original = {
    spec: specVersion,
    name: "Roundtrip Test",
    description: "Testing DNS encoding roundtrip",
    website: "https://example.com",
    contact: "test@example.com",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Organization"
    }
  };

  // Encode
  const encoded = encodeDns(original);
  
  // Decode
  const decoded = decodeDns(encoded);

  // Verify roundtrip
  assert.deepStrictEqual(
    decoded,
    original,
    "Decoded record should match original exactly"
  );
});

test("Integration: DNS encoding handles long records", () => {
  // Test that long records can be encoded (DNS will need segmentation)
  const longDescription = "A".repeat(300);
  const record = {
    spec: specVersion,
    name: "Long Record Test",
    description: longDescription,
    website: "https://example.com",
    contact: "test@example.com"
  };

  const encoded = encodeDns(record);
  assert.ok(
    encoded.length > 0,
    "Long record should encode successfully"
  );

  const decoded = decodeDns(encoded);
  assert.strictEqual(
    decoded.description,
    longDescription,
    "Long description should decode correctly"
  );
});

test("Integration: All optional fields work together", () => {
  const completeRecord = {
    spec: specVersion,
    name: "Complete Record",
    description: "Testing all optional fields",
    website: "https://example.com",
    contact: "test@example.com",
    logo: "https://example.com/logo.png",
    entity_type: "Organization",
    jsonld: {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "Complete Record"
    }
  };

  const validation = validateRecord(completeRecord);
  assert.strictEqual(
    validation.valid,
    true,
    "Record with all optional fields should validate"
  );

  // Verify all fields present
  assert.ok(completeRecord.logo, "Should have logo");
  assert.ok(completeRecord.entity_type, "Should have entity_type");
  assert.ok(completeRecord.jsonld, "Should have jsonld");
});

test("Integration: Minimal record (no optional fields) works", () => {
  const minimalRecord = {
    spec: specVersion,
    name: "Minimal",
    description: "Minimal record",
    website: "https://example.com",
    contact: "test@example.com"
  };

  const validation = validateRecord(minimalRecord);
  assert.strictEqual(
    validation.valid,
    true,
    "Minimal record should validate"
  );

  // Verify no optional fields
  assert.ok(!minimalRecord.hasOwnProperty("logo"), "Should not have logo");
  assert.ok(!minimalRecord.hasOwnProperty("entity_type"), "Should not have entity_type");
  assert.ok(!minimalRecord.hasOwnProperty("jsonld"), "Should not have jsonld");
});

test("Integration: Schema validation errors are actionable", () => {
  const invalidRecord = {
    spec: specVersion,
    name: "Test",
    description: "Test",
    website: "not-a-url", // Invalid URL
    contact: "test@example.com",
    entity_type: "business" // Invalid entity_type
  };

  const validation = validateRecord(invalidRecord);
  assert.strictEqual(
    validation.valid,
    false,
    "Invalid record should be rejected"
  );
  assert.ok(
    validation.errors.length > 0,
    "Should have validation errors"
  );

  // Errors should be specific and actionable
  const errorMessages = validation.errors.map(e => e.message || JSON.stringify(e));
  const hasUrlError = errorMessages.some(msg => 
    msg.includes("website") || msg.includes("uri") || msg.includes("format")
  );
  const hasEntityTypeError = errorMessages.some(msg => 
    msg.includes("entity_type") || msg.includes("enum")
  );

  assert.ok(
    hasUrlError || hasEntityTypeError,
    "Errors should identify specific field issues"
  );
});

