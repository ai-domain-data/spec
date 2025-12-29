# AI Domain Data Standard – Implementation Overview

This overview summarizes the reference tooling and integrations available in v0.1. Use it to select the right entry point—browser app, CLI, SDK, or automation—for your organization. The AI Domain Data record is served at `https://<domain>/.well-known/domain-profile.json` and optionally mirrored in DNS at `_ai.<domain>` TXT with `ai-json=<base64(JSON)>`.

---

## 1. AI Record Generator (web)

- Location: /generator
- Audience: Non-technical admins, marketers, comms teams
- Capabilities: field validation, JSON preview, Base64/DNS generation, copy buttons
- Deployment: React/Vite app that runs entirely client-side; host on any static site/CDN

Use this when you need a fast, guided way to author a compliant record without installing tooling.

---

## 2. AI Visibility Checker (web)

- Location: /checker
- Audience: QA and operations teams verifying adoption
- Capabilities: fetch `/.well-known/domain-profile.json`, query `_ai.<domain>` TXT, validate against schema-v0.1.json, show canonical source
- Deployment: Same React app as the generator (tabbed interface)

Use this before announcing adoption or turning on downstream integrations.

---

## 3. CLI – @ai-domain-data/cli (`aidd`)

- Commands:
- `aidd init` – scaffold `domain-profile.json` with placeholders
  - `aidd validate` – schema-check an existing file
  - `aidd emit` – output recommended DNS TXT and HTTPS payload
- Audience: Developers, CI/CD, release engineering
- Installation: `npm install --global @ai-domain-data/cli` or run via `npx @ai-domain-data/cli aidd --help`

Use the CLI to automate checks, gate pull requests, or keep `domain-profile.json` under version control.

---

## 4. Resolver SDK – @ai-domain-data/resolver

- API: `resolveAIDomainData(domain, options) → { source, valid, payload, errors, details }`
- Behavior: HTTPS-first resolution with DNS fallback following v0.1.1 (backward-compatible with v0.1) precedence rules
- Audience: AI tooling vendors, analytics platforms, marketplaces

Embed this library when you need to consume AI Domain Data records programmatically without recreating the fetch/validate logic.

---

## 5. GitHub Action – ai-domain-data-validate-action

- Repository: https://github.com/ai-domain-data/ai-domain-data-validate-action
- Behavior: Runs `aidd validate` during push / pull_request workflows
- Inputs: path to `domain-profile.json` (default `domain-profile.json`)
- Usage snippet:

  ```yaml
  - uses: ai-domain-data/ai-domain-data-validate-action@v0.1.1
    with:
      path: domain-profile.json
  ```

- Audience: Repositories that store `domain-profile.json` alongside code/content

Use this to block merges when the AI Domain Data record drifts from the schema. Tag `v0.1.1` is the latest stable release, or use `v0` to always get the latest compatible version.

---

## 6. WordPress Plugin

- **Available now:** [Install from WordPress.org](https://wordpress.org/plugins/ai-domain-data/)
- Features: Admin page under **Settings → AI Domain Data**, form-driven creation of `domain-profile.json`, DNS instructions, local tester
- Storage: Serves `/.well-known/domain-profile.json` via REST API endpoint
- GitHub: https://github.com/ai-domain-data/wordpress-ai-domain-data

Ideal for site owners who prefer a CMS-native workflow.

---

## 7. Cloudflare Worker

- **Available now:** [GitHub Repository](https://github.com/ai-domain-data/cloudflare-worker-ai-domain-data)
- Behavior: Serves `/.well-known/domain-profile.json` from environment variables or Workers KV with appropriate headers and caching
- Features: Built-in schema validation, CORS headers, TypeScript support, configurable via environment variables or KV storage
- Use cases: Global edge hosting, redundancy, or when origin environments can't expose .well-known
- Installation: Clone the repository, configure environment variables in `wrangler.toml`, and deploy with `npm run deploy`

Ideal for sites using Cloudflare Workers or needing edge-computed domain profiles.

---

## 8. Governance & versioning

- Track official updates at https://github.com/ai-domain-data/spec
- Treat `domain-profile.json` as a configuration artifact; review changes like any other metadata
- Use CLI/Action/SDK to ensure new versions remain compliant when the spec evolves

Adopting this tooling suite keeps the standard lightweight and self-hosted while providing clear upgrade paths for future versions.
