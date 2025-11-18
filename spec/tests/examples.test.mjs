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

// All examples from spec-v0.1.md
const examples = {
  personalPortfolio: {
    spec: specVersion,
    name: "Jordan Lee",
    description: "Independent UX engineer showcasing projects and research",
    website: "https://jordanlee.dev",
    contact: "hello@jordanlee.dev",
    entity_type: "Person"
  },
  openSourceProject: {
    spec: specVersion,
    name: "CacheForge",
    description: "Open-source toolkit for high-throughput caching middleware",
    website: "https://cacheforge.io",
    logo: "https://cacheforge.io/img/logo.png",
    contact: "https://github.com/cacheforge/cacheforge/discussions",
    entity_type: "Project"
  },
  saasProduct: {
    spec: specVersion,
    name: "Flowly",
    description: "Workflow automation software for product-led teams",
    website: "https://flowly.app",
    logo: "https://cdn.flowly.app/logo.svg",
    contact: "support@flowly.app",
    entity_type: "SoftwareApplication"
  },
  organizationWithJsonld: {
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
  },
  staticHosting: {
    spec: specVersion,
    name: "Example Publisher",
    description: "Archive of agency-ready resources for machines and AI",
    website: "https://example.com",
    contact: "https://example.com/contact",
    entity_type: "CreativeWork"
  }
};

test("Example: Personal portfolio", () => {
  const result = validateRecord(examples.personalPortfolio);
  assert.strictEqual(
    result.valid,
    true,
    `Personal portfolio example should validate. Errors: ${JSON.stringify(result.errors)}`
  );
  assert.strictEqual(
    examples.personalPortfolio.entity_type,
    "Person",
    "Should use schema.org Person type"
  );
  assert.ok(
    !examples.personalPortfolio.logo,
    "Personal portfolio example correctly omits optional logo field"
  );
});

test("Example: Open-source project", () => {
  const result = validateRecord(examples.openSourceProject);
  assert.strictEqual(
    result.valid,
    true,
    `Open-source project example should validate. Errors: ${JSON.stringify(result.errors)}`
  );
  assert.strictEqual(
    examples.openSourceProject.entity_type,
    "Project",
    "Should use schema.org Project type"
  );
  assert.ok(
    examples.openSourceProject.logo,
    "Open-source project example includes optional logo field"
  );
  assert.ok(
    examples.openSourceProject.contact.startsWith("http"),
    "Contact can be a URL (GitHub discussions link)"
  );
});

test("Example: SaaS product", () => {
  const result = validateRecord(examples.saasProduct);
  assert.strictEqual(
    result.valid,
    true,
    `SaaS product example should validate. Errors: ${JSON.stringify(result.errors)}`
  );
  assert.strictEqual(
    examples.saasProduct.entity_type,
    "SoftwareApplication",
    "Should use schema.org SoftwareApplication type"
  );
  assert.ok(
    examples.saasProduct.logo,
    "SaaS product example includes optional logo field"
  );
  assert.ok(
    examples.saasProduct.contact.includes("@"),
    "Contact is an email address"
  );
});

test("Example: Organization with embedded JSON-LD", () => {
  const result = validateRecord(examples.organizationWithJsonld);
  assert.strictEqual(
    result.valid,
    true,
    `Organization with JSON-LD example should validate. Errors: ${JSON.stringify(result.errors)}`
  );
  assert.strictEqual(
    examples.organizationWithJsonld.entity_type,
    "Organization",
    "Should use schema.org Organization type"
  );
  assert.ok(
    examples.organizationWithJsonld.jsonld,
    "Example includes optional jsonld field"
  );
  assert.strictEqual(
    examples.organizationWithJsonld.jsonld["@context"],
    "https://schema.org",
    "jsonld should have schema.org context"
  );
  assert.strictEqual(
    examples.organizationWithJsonld.jsonld["@type"],
    "Organization",
    "jsonld should have @type matching entity_type"
  );
  assert.ok(
    examples.organizationWithJsonld.jsonld.address,
    "jsonld can contain additional structured data (address)"
  );
});

test("Example: Static hosting", () => {
  const result = validateRecord(examples.staticHosting);
  assert.strictEqual(
    result.valid,
    true,
    `Static hosting example should validate. Errors: ${JSON.stringify(result.errors)}`
  );
  assert.strictEqual(
    examples.staticHosting.entity_type,
    "CreativeWork",
    "Should use schema.org CreativeWork type"
  );
  assert.ok(
    !examples.staticHosting.logo,
    "Static hosting example correctly omits optional logo field"
  );
  assert.ok(
    !examples.staticHosting.jsonld,
    "Static hosting example correctly omits optional jsonld field"
  );
});

// Test examples with and without optional fields
test("Examples: Backward compatibility (without optional fields)", () => {
  // Test that examples work without optional fields
  const minimalPersonal = {
    spec: specVersion,
    name: examples.personalPortfolio.name,
    description: examples.personalPortfolio.description,
    website: examples.personalPortfolio.website,
    contact: examples.personalPortfolio.contact
  };
  
  const result = validateRecord(minimalPersonal);
  assert.strictEqual(
    result.valid,
    true,
    "Personal portfolio example should work without optional fields"
  );
});

test("Examples: All use schema.org entity_type values", () => {
  const entityTypes = [
    examples.personalPortfolio.entity_type,
    examples.openSourceProject.entity_type,
    examples.saasProduct.entity_type,
    examples.organizationWithJsonld.entity_type,
    examples.staticHosting.entity_type
  ];
  
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
  
  entityTypes.forEach((type) => {
    assert.ok(
      schemaOrgTypes.includes(type),
      `Entity type "${type}" should be a valid schema.org @type value`
    );
  });
});

test("Examples: All have required fields", () => {
  const requiredFields = ["spec", "name", "description", "website", "contact"];
  
  Object.values(examples).forEach((example, index) => {
    const exampleName = Object.keys(examples)[index];
    requiredFields.forEach((field) => {
      assert.ok(
        example[field] !== undefined,
        `Example "${exampleName}" must have required field "${field}"`
      );
      assert.ok(
        typeof example[field] === "string" && example[field].length > 0,
        `Example "${exampleName}" field "${field}" must be a non-empty string`
      );
    });
  });
});

test("Examples: Contact field formats", () => {
  // Email addresses
  assert.ok(
    examples.personalPortfolio.contact.includes("@"),
    "Personal portfolio uses email contact"
  );
  assert.ok(
    examples.saasProduct.contact.includes("@"),
    "SaaS product uses email contact"
  );
  assert.ok(
    examples.organizationWithJsonld.contact.includes("@"),
    "Organization uses email contact"
  );
  
  // URLs
  assert.ok(
    examples.openSourceProject.contact.startsWith("http"),
    "Open-source project uses URL contact"
  );
  assert.ok(
    examples.staticHosting.contact.startsWith("http"),
    "Static hosting uses URL contact"
  );
});

