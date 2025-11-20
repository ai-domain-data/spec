# @ai-domain-data/nextjs

Next.js integration for the [AI Domain Data Standard](https://ai-domain-data.org). Add `domain-profile.json` to your Next.js site with support for both App Router and Pages Router.

## Installation

```bash
npm install @ai-domain-data/nextjs
```

## Quick Start

### App Router (Next.js 13+)

Create `app/.well-known/domain-profile.json/route.ts`:

```typescript
import { createAIDomainDataRoute } from "@ai-domain-data/nextjs/app-router";

export const GET = createAIDomainDataRoute({
  useEnv: true,
});
```

### Pages Router (Next.js 12 and below)

Create `pages/api/.well-known/domain-profile.json.ts`:

```typescript
import { createAIDomainDataHandler } from "@ai-domain-data/nextjs/pages-router";

export default createAIDomainDataHandler({
  useEnv: true,
});
```

### Environment Variables

Add to `.env.local` (quotes are optional and will be automatically stripped):

```
NEXT_PUBLIC_SITE_NAME=Your Site Name
NEXT_PUBLIC_SITE_DESCRIPTION=Your site description
NEXT_PUBLIC_SITE_URL=https://yoursite.com
NEXT_PUBLIC_SITE_CONTACT=contact@yoursite.com
NEXT_PUBLIC_ENTITY_TYPE=Organization
NEXT_PUBLIC_SITE_LOGO=https://yoursite.com/logo.png
```

**Note:** Quotes around values are optional. If you include them, they will be automatically removed. Values with spaces work fine without quotes.

That's it! Your domain profile will be available at `https://yoursite.com/.well-known/domain-profile.json`.

## Configuration Options

### Using Environment Variables (Recommended)

The package automatically reads from environment variables:

```typescript
export const GET = createAIDomainDataRoute({
  useEnv: true, // default
});
```

Environment variables:
- `NEXT_PUBLIC_SITE_NAME` or `SITE_NAME` - Site name
- `NEXT_PUBLIC_SITE_DESCRIPTION` or `SITE_DESCRIPTION` - Site description
- `NEXT_PUBLIC_SITE_URL` or `SITE_URL` - Website URL
- `NEXT_PUBLIC_SITE_CONTACT` or `SITE_CONTACT` - Contact email/URL
- `NEXT_PUBLIC_SITE_LOGO` or `SITE_LOGO` - Logo URL (optional)
- `NEXT_PUBLIC_ENTITY_TYPE` or `ENTITY_TYPE` - Entity type (optional)

### Using Config Object

Provide configuration directly:

```typescript
export const GET = createAIDomainDataRoute({
  config: {
    name: "My Site",
    description: "A great website",
    website: "https://example.com",
    contact: "hello@example.com",
    entity_type: "Organization",
    logo: "https://example.com/logo.png",
  },
  cacheMaxAge: 3600, // optional, default: 3600 seconds
});
```

### Custom Cache Settings

Control caching behavior:

```typescript
export const GET = createAIDomainDataRoute({
  useEnv: true,
  cacheMaxAge: 7200, // 2 hours
});
```

## API Reference

### App Router

#### `createAIDomainDataRoute(options?)`

Creates a Next.js App Router route handler for `/.well-known/domain-profile.json`.

**Options:**
- `config?: AIDomainDataConfig` - Direct configuration object
- `useEnv?: boolean` - Use environment variables (default: `true`)
- `cacheMaxAge?: number` - Cache max age in seconds (default: `3600`)

**Returns:** Route handler function compatible with App Router.

**Example:**
```typescript
import { createAIDomainDataRoute } from "@ai-domain-data/nextjs/app-router";

export const GET = createAIDomainDataRoute({
  useEnv: true,
});
```

### Pages Router

#### `createAIDomainDataHandler(options?)`

Creates a Next.js Pages Router API handler for `/.well-known/domain-profile.json`.

**Options:**
- `config?: AIDomainDataConfig` - Direct configuration object
- `useEnv?: boolean` - Use environment variables (default: `true`)
- `cacheMaxAge?: number` - Cache max age in seconds (default: `3600`)

**Returns:** API route handler compatible with Pages Router.

**Example:**
```typescript
import { createAIDomainDataHandler } from "@ai-domain-data/nextjs/pages-router";

export default createAIDomainDataHandler({
  useEnv: true,
});
```

### Utilities

#### `generateAIDomainData(config)`

Generate a validated AI Domain Data payload from a configuration object.

```typescript
import { generateAIDomainData } from "@ai-domain-data/nextjs";

const payload = generateAIDomainData({
  name: "My Site",
  description: "Description",
  website: "https://example.com",
  contact: "contact@example.com",
});
```

#### `validateAIDomainData(data)`

Validate data against the AI Domain Data Standard schema.

```typescript
import { validateAIDomainData } from "@ai-domain-data/nextjs";

const result = validateAIDomainData(data);
if (!result.valid) {
  console.error(result.errors);
}
```

## TypeScript Support

Full TypeScript support is included. Types are exported from the main package:

```typescript
import type { AIDomainDataConfig, AIDomainDataPayload } from "@ai-domain-data/nextjs";
```

## Validation

The package automatically validates your configuration against the AI Domain Data Standard v0.1.1 schema. Invalid configurations will throw errors with detailed messages to help you fix issues.

## Entity Types

The `entity_type` field must be one of the following schema.org values:

- `Organization`
- `Person`
- `Blog`
- `NGO`
- `Community`
- `Project`
- `CreativeWork`
- `SoftwareApplication`
- `Thing`

## Examples

See the `examples/` directory for complete working examples for both App Router and Pages Router.

## Requirements

- Next.js 13.0.0 or higher
- React 18.0.0 or higher
- Node.js 18.17.0 or higher

## Related Packages

- `@ai-domain-data/cli` - Command-line tool for validation and generation
- `@ai-domain-data/resolver` - TypeScript SDK for resolving domain profiles

## Links

- [AI Domain Data Standard](https://ai-domain-data.org)
- [GitHub Repository](https://github.com/ai-domain-data/spec)
- [Documentation](https://github.com/ai-domain-data/spec/tree/main/packages/nextjs)

## License

MIT

