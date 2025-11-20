import { createAIDomainDataRoute } from "@ai-domain-data/nextjs/app-router";

export const GET = createAIDomainDataRoute({
  useEnv: true,
  cacheMaxAge: 3600,
});

