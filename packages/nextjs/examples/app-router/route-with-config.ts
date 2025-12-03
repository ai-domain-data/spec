import { createAIDomainDataRoute } from "@ai-domain-data/nextjs/app-router";

// Required for static export (output: "export" in next.config.js)
export const dynamic = "force-static";

export const GET = createAIDomainDataRoute({
  config: {
    name: "My Next.js Site",
    description: "A Next.js site with AI Domain Data support",
    website: "https://example.com",
    contact: "contact@example.com",
    entity_type: "Organization",
    logo: "https://example.com/logo.png",
  },
  cacheMaxAge: 3600,
});

