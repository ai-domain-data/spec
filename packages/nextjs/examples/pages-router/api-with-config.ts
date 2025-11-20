import { createAIDomainDataHandler } from "@ai-domain-data/nextjs/pages-router";

export default createAIDomainDataHandler({
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

