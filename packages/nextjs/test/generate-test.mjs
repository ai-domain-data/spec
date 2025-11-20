import { generateAIDomainData, generateAIDomainDataFromEnv } from "../dist/generate.js";

console.log("Testing generate functions...\n");

// Test 1: Generate with config
console.log("Test 1: generateAIDomainData with config");
try {
  const payload = generateAIDomainData({
    name: "Test Site",
    description: "A test site",
    website: "https://example.com",
    contact: "test@example.com",
    entity_type: "Organization",
    logo: "https://example.com/logo.png",
  });
  
  if (payload.spec === "https://ai-domain-data.org/spec/v0.1" &&
      payload.name === "Test Site" &&
      payload.entity_type === "Organization") {
    console.log("✓ generateAIDomainData works correctly");
  } else {
    console.log("✗ generateAIDomainData failed");
    process.exit(1);
  }
} catch (error) {
  console.error("✗ generateAIDomainData failed:", error.message);
  process.exit(1);
}

// Test 2: Generate from env (with mocked env)
console.log("\nTest 2: generateAIDomainDataFromEnv");
try {
  process.env.NEXT_PUBLIC_SITE_NAME = "Env Test Site";
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION = "Env description";
  process.env.NEXT_PUBLIC_SITE_URL = "https://env.example.com";
  process.env.NEXT_PUBLIC_SITE_CONTACT = "env@example.com";
  process.env.NEXT_PUBLIC_ENTITY_TYPE = "Organization";
  
  const envPayload = generateAIDomainDataFromEnv();
  
  if (envPayload.name === "Env Test Site" &&
      envPayload.website === "https://env.example.com" &&
      envPayload.entity_type === "Organization") {
    console.log("✓ generateAIDomainDataFromEnv works correctly");
  } else {
    console.log("✗ generateAIDomainDataFromEnv failed");
    process.exit(1);
  }
} catch (error) {
  console.error("✗ generateAIDomainDataFromEnv failed:", error.message);
  process.exit(1);
}

// Test 3: Invalid config should throw
console.log("\nTest 3: Invalid config throws error");
try {
  generateAIDomainData({
    name: "",
    description: "Test",
    website: "not-a-url",
    contact: "",
  });
  console.log("✗ Should have thrown error for invalid config");
  process.exit(1);
} catch (error) {
  if (error.message.includes("Invalid AI Domain Data")) {
    console.log("✓ Correctly throws error for invalid config");
  } else {
    console.log("✗ Wrong error message:", error.message);
    process.exit(1);
  }
}

console.log("\n✓ All generate tests passed!");

