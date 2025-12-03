import { createAIDomainDataRoute } from "@ai-domain-data/nextjs/app-router";

// Required for static export (output: "export" in next.config.js)
export const dynamic = "force-static";

export const GET = createAIDomainDataRoute({
  useEnv: true,
  cacheMaxAge: 3600,
});

