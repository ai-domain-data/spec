# AI Domain Data Standard — Working Repository

This repository houses the v0.1.1 standard (backward-compatible with v0.1), reference tooling, and outreach material for the AI Domain Data initiative — the open, vendor-neutral format for authoritative domain data consumed by AI systems, search, and other automated agents. Publishers self-host their JSON record at `https://<domain>/.well-known/domain-profile.json` and optionally mirror it via `_ai.<domain>` TXT (`ai-json=<base64(JSON)>`).

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
  tests/              Automated test suites (schema validation, examples, edge cases, backward compatibility)
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

## Roadmap alignment

This working repo covers everything required for Phases 1–3:

1. **Brand + Spec + Proof** – Docs, schema, generator, checker.
2. **Distribution + Influencers** – Clarity and outreach resources for getting the spec adopted.
3. **Minimal Implementation** – CLI and resolver packages for self-hosted workflows.

Future integrations (e.g., WordPress plugin, GitHub Action, Cloudflare Worker) will also land here once they are ready for public testing.

