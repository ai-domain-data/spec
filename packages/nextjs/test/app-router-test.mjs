import { createAIDomainDataRoute } from "../dist/app-router.js";

console.log("Testing App Router helper...\n");

// Mock NextResponse for testing
const mockNextResponse = {
  json: (data, options) => ({
    data,
    headers: options?.headers || {},
    status: 200,
  }),
};

// Temporarily replace NextResponse
const originalNextResponse = global.NextResponse;
global.NextResponse = mockNextResponse;

try {
  const route = createAIDomainDataRoute({
    config: {
      name: "Test Site",
      description: "Test description",
      website: "https://example.com",
      contact: "test@example.com",
    },
  });
  
  const response = await route();
  
  if (response.data && response.data.spec === "https://ai-domain-data.org/spec/v0.1") {
    console.log("✓ App Router route created successfully");
    console.log("  Response:", JSON.stringify(response.data, null, 2));
    console.log("  Headers:", response.headers);
  } else {
    console.log("✗ App Router route failed");
    process.exit(1);
  }
  
  global.NextResponse = originalNextResponse;
  console.log("\n✓ App Router test passed!");
  
} catch (error) {
  global.NextResponse = originalNextResponse;
  console.error("✗ App Router test failed:", error.message);
  process.exit(1);
}

