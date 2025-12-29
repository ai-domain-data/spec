# AI Domain Data Standard — Working Repository

This repository houses the v0.1.1 standard (backward-compatible with v0.1), reference tooling, and outreach material for the AI Domain Data initiative — the open, vendor-neutral format for authoritative domain data consumed by AI systems, search, and other automated agents. Publishers self-host their JSON record at `https://<domain>/.well-known/domain-profile.json` and optionally mirror it via `_ai.<domain>` TXT (`ai-json=<base64(JSON)>`).

## Structure

```
spec/                 Human-readable spec, schema, and outreach content
  docs/               Intro, guides, adoption resources
  spec/               Canonical spec markdown + JSON schema
  tests/              Automated test suites (schema validation, examples, edge cases, backward compatibility)
packages/
  cli/                `aidd` CLI for init/validate/emit workflows
  resolver/           Node/TypeScript resolver SDK
  nextjs/             Next.js integration package (@ai-domain-data/nextjs)
LICENSE               MIT License
```

## Getting started

### CLI

```
npm run build --workspace @ai-domain-data/cli
npx @ai-domain-data/cli aidd --help
```

### Resolver SDK

```
npm run build --workspace @ai-domain-data/resolver
```

### Tests

```
npm run test:spec
```

Runs all test suites in `spec/tests/`:
- Schema validation tests
- Example validation tests
- Backward compatibility tests
- Edge case tests

## Specification

- `spec/spec/spec-v0.1.md` – Normative spec text for the v0.1.1 release (backward-compatible with v0.1), including schema.org interoperability mapping and precedence rules.
- `spec/spec/schema-v0.1.json` – Canonical JSON schema (with optional `logo`, `entity_type`, and `jsonld`). Also available at `https://ai-domain-data.org/spec/schema-v0.1.json`.
- `spec/examples/basic.json` – Minimal valid record with only required fields.
- `spec/examples/with-jsonld.json` – Complete record demonstrating all optional fields including `logo`, `entity_type`, and embedded `jsonld`.
- `spec/docs/introduction.md` – Plain-language overview of why the standard exists.
- `spec/docs/technical-guide-v0.1.md` – Implementation details for publishers and integrators, including schema.org integration guidance.
- `spec/docs/adoption-guide.md` – Rollout and governance checklist for domain owners.
- `spec/docs/implementation-overview.md` – Summary of the included tooling.
- `spec/docs/aidd-vs-ai-txt.md` – Comparison of AIDD and ai.txt, explaining their complementary purposes.

## For Integrators

If you're building a plugin, CMS integration, or platform feature that adds one-click support for `domain-profile.json`, see:

- **`spec/docs/integrator-quickstart.md`** – Practical guide for plugin authors covering required/optional fields, error handling, validation, and versioning policy. Start here for implementation details.

## Integrations & Plugins

Add AI Domain Data support to your site in minutes with our official integrations. Each package handles validation, generation, and deployment automatically.

### Next.js

**`@ai-domain-data/nextjs`** – Add `domain-profile.json` to your Next.js site with zero configuration. Supports both App Router and Pages Router.

```bash
npm install @ai-domain-data/nextjs
```

**Features:**
- Automatic route generation for `/.well-known/domain-profile.json`
- Environment variable support with smart defaults
- Full TypeScript support with type-safe configuration
- Built-in schema validation
- Works with Next.js 13+ (App Router) and Next.js 12 (Pages Router)

**Quick Start:**
```typescript
// app/.well-known/domain-profile.json/route.ts
import { createAIDomainDataRoute } from "@ai-domain-data/nextjs/app-router";

export const GET = createAIDomainDataRoute({ useEnv: true });
```

**[Install on npm](https://www.npmjs.com/package/@ai-domain-data/nextjs)** | **[Full Documentation](packages/nextjs/README.md)** | 🔗 **[GitHub](https://github.com/ai-domain-data/spec/tree/main/packages/nextjs)**

---

### Jekyll

**`jekyll-ai-domain-data`** – Automatically generate and validate `domain-profile.json` during Jekyll site builds. Zero manual file management required.

```ruby
gem "jekyll-ai-domain-data"
```

**Features:**
- Automatic file generation during site build
- Validates against the official schema before publishing
- Liquid tags for embedding domain data in templates
- Smart fallbacks to existing Jekyll configuration
- Works with Jekyll 3.8+ and 4.x

**Quick Start:**
```yaml
# _config.yml
plugins:
  - jekyll-ai-domain-data

ai_domain_data:
  contact: "hello@example.com"
  entity_type: "Organization"
```

**[Install on RubyGems](https://rubygems.org/gems/jekyll-ai-domain-data)** | **[Full Documentation](https://github.com/ai-domain-data/jekyll-ai-domain-data#readme)** | 🔗 **[GitHub](https://github.com/ai-domain-data/jekyll-ai-domain-data)**

---

### WordPress

**`ai-domain-data`** – One-click installation for WordPress sites. Automatically generates and serves `domain-profile.json` via REST API.

```bash
# Install from WordPress.org
# Or: wp plugin install ai-domain-data --activate
```

**Features:**
- Admin interface under Settings → AI Domain Data
- Automatic generation from WordPress site settings
- REST API endpoint for `/.well-known/domain-profile.json`
- Built-in validation and DNS instructions
- Smart defaults from your WordPress configuration

**[Install from WordPress.org](https://wordpress.org/plugins/ai-domain-data/)** | **[Full Documentation](https://github.com/ai-domain-data/wordpress-ai-domain-data#readme)** | 🔗 **[GitHub](https://github.com/ai-domain-data/wordpress-ai-domain-data)**

---

### GitHub Action

**`ai-domain-data-validate-action`** – Validate `domain-profile.json` files in CI/CD workflows. Automatically blocks merges when the AI Domain Data record doesn't match the schema.

```yaml
- uses: ai-domain-data/ai-domain-data-validate-action@v0.1.1
  with:
    path: domain-profile.json
```

**Features:**
- Validates against the official AI Domain Data Standard schema
- Fails workflows on validation errors
- Works with any repository that stores `domain-profile.json`
- Supports custom file paths

**[View on GitHub](https://github.com/ai-domain-data/ai-domain-data-validate-action)** | **[Use in Workflows](https://github.com/ai-domain-data/ai-domain-data-validate-action#usage)**

---

### Cloudflare Worker

**`cloudflare-worker-ai-domain-data`** – Production-ready Cloudflare Worker for serving `domain-profile.json` at the edge. Configure via environment variables or Cloudflare KV.

**Features:**
- Serves `/.well-known/domain-profile.json` with proper CORS headers
- Configurable via environment variables or Cloudflare KV
- Built-in schema validation
- TypeScript with full type safety
- Production-ready with proper caching headers

**Quick Start:**
```bash
# Install dependencies
npm install

# Configure in wrangler.toml
# Deploy
npm run deploy
```

**[View on GitHub](https://github.com/ai-domain-data/cloudflare-worker-ai-domain-data)** | **[Full Documentation](https://github.com/ai-domain-data/cloudflare-worker-ai-domain-data#readme)**

---

### More Integrations Coming Soon

- **GitHub Pages Action** – Automated deployment for static sites

Have a platform you'd like to see supported? [Open an issue](https://github.com/ai-domain-data/spec/issues) or [contribute an integration](spec/docs/integrator-quickstart.md).

## Roadmap alignment

This working repo covers everything required for Phases 1–3:

1. **Brand + Spec + Proof** – Docs, schema, generator, checker.
2. **Distribution + Influencers** – Clarity and outreach resources for getting the spec adopted.
3. **Minimal Implementation** – CLI and resolver packages for self-hosted workflows.

The WordPress plugin, GitHub Action, and Cloudflare Worker are now available. Future integrations will also land here once they are ready for public testing.

