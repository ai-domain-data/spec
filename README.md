# AI Domain Data Standard — Working Repository

This repository houses the v0.1 standard, reference tooling, and outreach material for the AI Domain Data initiative — the open, vendor-neutral format for authoritative domain data consumed by AI systems, search, and other automated agents. Publishers self-host their JSON record at `https://<domain>/.well-known/domain-profile.json` and optionally mirror it via `_ai.<domain>` TXT (`ai-json=<base64(JSON)>`).

## Structure

```
site/                 React/Vite workspace for generator + visibility checker
  checker/            Checker-specific UI + logic
  components/         Shared React components
  generator/          Generator-specific UI + logic
  src/                App shell + routing/entry files
  styles/             Global CSS + tokens
  index.html          Vite template
  package.json        Workspace manifest
spec/                 Human-readable spec, schema, and outreach content
  docs/               Intro, guides, adoption resources
  spec/               Canonical spec markdown + JSON schema
packages/
  cli/                `aidd` CLI for init/validate/emit workflows
  resolver/           Node/TypeScript resolver SDK
LICENSE               MIT License
```

## Getting started

```bash
npm install
npm run dev --workspace @ai-domain-data/site
```

Visit `http://localhost:5173` (default Vite port) to use the generator and checker locally.

### CLI

```
npm run build --workspace @ai-domain-data/cli
npx @ai-domain-data/cli aidd --help
```

### Resolver SDK

```
npm run build --workspace @ai-domain-data/resolver
```

## Specification

- `spec/README.md` – Primary spec document with publishing walkthroughs.
- `spec/schema-v0.1.json` – Canonical JSON schema (with optional `entity_type`).
- `spec/outreach-short.md` – Non-technical briefing for marketers and SEO professionals.
- `spec/outreach-long.md` – Technical deep-dive for developers and platform teams.

## Roadmap alignment

This working repo covers everything required for Phases 1–3:

1. **Brand + Spec + Proof** – Docs, schema, generator, checker.
2. **Distribution + Influencers** – Outreach materials and spec clarity.
3. **Minimal Implementation** – CLI and resolver packages.

Phase 4 integrations (WordPress plugin, GitHub Action, Cloudflare Worker) and Phase 5 SaaS explorations will be staged here before moving to public organization-owned repositories.

