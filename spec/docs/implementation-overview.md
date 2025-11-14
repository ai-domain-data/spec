# AI Domain Data Standard – Implementation Overview

This overview summarizes the reference tooling and integrations available in v0.1. Use it to select the right entry point—browser app, CLI, SDK, or automation—for your organization.

---

## 1. AI Record Generator (web)

- Location: /site/generator
- Audience: Non-technical admins, marketers, comms teams
- Capabilities: field validation, JSON preview, Base64/DNS generation, copy buttons
- Deployment: React/Vite app that runs entirely client-side; host on any static site/CDN

Use this when you need a fast, guided way to author a compliant record without installing tooling.

---

## 2. AI Visibility Checker (web)

- Location: /site/checker
- Audience: QA and operations teams verifying adoption
- Capabilities: fetch /.well-known/ai.json, query _ai.<domain> TXT, validate against schema-v0.1.json, show canonical source
- Deployment: Same React app as the generator (tabbed interface)

Use this before announcing adoption or turning on downstream integrations.

---

## 3. CLI – @ai-domain-data/cli (idd)

- Commands:
  - idd init – scaffold i.json with placeholders
  - idd validate – schema-check an existing file
  - idd emit – output recommended DNS TXT and HTTPS payload
- Audience: Developers, CI/CD, release engineering
- Installation: 
pm install --global @ai-domain-data/cli or run via 
px

Use the CLI to automate checks, gate pull requests, or keep i.json under version control.

---

## 4. Resolver SDK – @ai-domain-data/resolver

- API: esolveAIDomainData(domain, options) → { source, valid, payload, errors, details }
- Behavior: HTTPS-first resolution with DNS fallback following v0.1 precedence rules
- Audience: AI tooling vendors, analytics platforms, marketplaces

Embed this library when you need to consume AI Domain Data records programmatically without recreating the fetch/validate logic.

---

## 5. GitHub Action (Phase 4 deliverable)

- Name: i-domain-data-validate
- Behavior: Runs idd validate during push/pull_request
- Inputs: path to i.json (default i.json)
- Audience: Repositories that store i.json alongside code/content

Use this to block merges when the AI Domain Data record drifts from the schema.

---

## 6. WordPress Plugin (Phase 4 deliverable)

- Features: Admin page under **Settings → AI Domain Data**, form-driven creation of i.json, DNS instructions, local tester
- Storage: Writes to wp-content/uploads/ai-domain-data/ai.json (or .well-known/ai.json if configured)

Ideal for site owners who prefer a CMS-native workflow.

---

## 7. Cloudflare Worker Template (Phase 4 deliverable)

- Behavior: Serves /.well-known/ai.json from Workers KV with appropriate headers and caching
- Use cases: Global edge hosting, redundancy, or when origin environments can’t expose .well-known

---

## 8. Governance & versioning

- Track official updates at https://github.com/ai-domain-data/spec
- Treat i.json as a configuration artifact; review changes like any other metadata
- Use CLI/Action/SDK to ensure new versions remain compliant when the spec evolves

Adopting this tooling suite keeps the standard lightweight and self-hosted while providing clear upgrade paths for future versions.
