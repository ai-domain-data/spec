import { createAIDomainDataHandler } from "@ai-domain-data/nextjs/pages-router";

export default createAIDomainDataHandler({
  useEnv: true,
  cacheMaxAge: 3600,
});

