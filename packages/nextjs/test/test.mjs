import { generateAIDomainData, validateAIDomainData } from "../dist/index.js";

console.log("Testing AI Domain Data Next.js package...\n");

// Test 1: Generate with config
console.log("Test 1: Generate with config object");
try {
  const payload = generateAIDomainData({
    name: "Test Site",
    description: "A test site for AI Domain Data",
    website: "https://example.com",
    contact: "test@example.com",
    entity_type: "Organization",
  });
  
  console.log("✓ Generated payload:", JSON.stringify(payload, null, 2));
  
  // Test 2: Validate
  console.log("\nTest 2: Validate generated payload");
  const validation = validateAIDomainData(payload);
  if (validation.valid) {
    console.log("✓ Validation passed");
  } else {
    console.log("✗ Validation failed:", validation.errors);
    process.exit(1);
  }
  
  // Test 3: Invalid data
  console.log("\nTest 3: Validate invalid data");
  const invalidValidation = validateAIDomainData({
    name: "",
    description: "Test",
    website: "not-a-url",
    contact: "",
  });
  if (!invalidValidation.valid) {
    console.log("✓ Correctly rejected invalid data");
    console.log("  Errors:", invalidValidation.errors);
  } else {
    console.log("✗ Should have rejected invalid data");
    process.exit(1);
  }
  
  // Test 4: Missing required field
  console.log("\nTest 4: Missing required field");
  const missingValidation = validateAIDomainData({
    name: "Test",
    description: "Test",
    website: "https://example.com",
    // missing contact
  });
  if (!missingValidation.valid) {
    console.log("✓ Correctly rejected missing required field");
  } else {
    console.log("✗ Should have rejected missing contact");
    process.exit(1);
  }
  
  console.log("\n✓ All tests passed!");
  
} catch (error) {
  console.error("✗ Test failed:", error.message);
  process.exit(1);
}

