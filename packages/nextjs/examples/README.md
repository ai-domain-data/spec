# Next.js AI Domain Data Examples

This directory contains example implementations for adding AI Domain Data support to Next.js sites.

## App Router (Next.js 13+)

### Using Environment Variables

Create `app/.well-known/domain-profile.json/route.ts`:

```typescript
import { createAIDomainDataRoute } from "@ai-domain-data/nextjs/app-router";

export const GET = createAIDomainDataRoute({
  useEnv: true,
});
```

Add to `.env.local`:

```
NEXT_PUBLIC_SITE_NAME="Your Site Name"
NEXT_PUBLIC_SITE_DESCRIPTION="Your site description"
NEXT_PUBLIC_SITE_URL="https://yoursite.com"
NEXT_PUBLIC_SITE_CONTACT="contact@yoursite.com"
NEXT_PUBLIC_ENTITY_TYPE="Organization"
NEXT_PUBLIC_SITE_LOGO="https://yoursite.com/logo.png"
```

### Using Config Object

Create `app/.well-known/domain-profile.json/route.ts`:

```typescript
import { createAIDomainDataRoute } from "@ai-domain-data/nextjs/app-router";

export const GET = createAIDomainDataRoute({
  config: {
    name: "Your Site Name",
    description: "Your site description",
    website: "https://yoursite.com",
    contact: "contact@yoursite.com",
    entity_type: "Organization",
  },
});
```

## Pages Router (Next.js 12 and below)

### Using Environment Variables

Create `pages/api/.well-known/domain-profile.json.ts`:

```typescript
import { createAIDomainDataHandler } from "@ai-domain-data/nextjs/pages-router";

export default createAIDomainDataHandler({
  useEnv: true,
});
```

### Using Config Object

Create `pages/api/.well-known/domain-profile.json.ts`:

```typescript
import { createAIDomainDataHandler } from "@ai-domain-data/nextjs/pages-router";

export default createAIDomainDataHandler({
  config: {
    name: "Your Site Name",
    description: "Your site description",
    website: "https://yoursite.com",
    contact: "contact@yoursite.com",
    entity_type: "Organization",
  },
});
```

## Notes

- The file will be available at `https://yoursite.com/.well-known/domain-profile.json`
- Responses are cached for 1 hour by default (configurable via `cacheMaxAge`)
- The package validates your data against the AI Domain Data Standard schema
- Invalid configurations will throw errors to help you fix issues early

