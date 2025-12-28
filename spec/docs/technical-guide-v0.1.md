# A Technical Guide to the AI Domain Data Standard v0.1.1

AI systems increasingly act as the first point of contact between audiences and the domains they care about. Chatbots summarize brands, personal assistants vet nonprofits, and search engines remix web content into conversational answers. Yet the data powering these assistants is inconsistent. Metadata is scattered across schemas, social profiles, knowledge graphs, and unstructured web pages. The AI Domain Data Standard exists to give every domain owner—businesses, publishers, communities, creators, open-source maintainers—a uniform, self-hosted way to publish canonical facts.

This document explains the technical underpinnings of the v0.1.1 release (backward-compatible with v0.1), how to publish compliant records, and how to integrate the standard into your toolchain.

**Quick start:** See [`spec/examples/basic.json`](../examples/basic.json) for a minimal valid record, or [`spec/examples/with-jsonld.json`](../examples/with-jsonld.json) for a complete example with all optional fields.

---

## 1. Model overview

At launch, the standard intentionally focuses on identity and ownership. The v0.1.1 schema (backward-compatible with v0.1) is a constrained JSON document containing:

```json
{
  "spec": "https://ai-domain-data.org/spec/v0.1",
  "name": "string",
  "description": "string",
  "website": "string (URL)",
  "logo": "string (URL, optional)",
  "contact": "string (email or URL)",
  "entity_type": "string (optional)",
  "jsonld": "object (optional)"
}
```

- **spec** references the exact version of the standard, enabling future upgrades without ambiguity.
- **name** and **description** give AI systems a tight summary block to quote.
- **website** and **contact** surface official touchpoints.
- **logo** is optional (many sites do not have a logo). When provided, it should be a publicly accessible image URL.
- **entity_type** is optional and exists purely for downstream classification. SHOULD use schema.org `@type` values directly for maximum interoperability: `Organization`, `Person`, `Blog`, `NGO`, `Community`, `Project`, `CreativeWork`, `SoftwareApplication`, or `Thing`. See the [recommended entity types](../spec/spec-v0.1.md#recommended-entity-types) section in the spec for full details.
- **jsonld** is optional. If present, it must be an object containing a JSON-LD block for alignment with schema.org. Consumers can safely ignore this field if they do not process JSON-LD.

The schema disallows additional properties. That constraint keeps the payload predictable for consumers and ensures future extensions arrive through version bumps or sanctioned add-ons rather than ad-hoc fields.

### 1.1 Interoperability with schema.org

AIDD is designed to work alongside existing structured data standards, particularly schema.org JSON-LD. The spec includes a [field mapping table](../spec/spec-v0.1.md#aidd-to-schemaorg-field-mapping) that shows how AIDD fields correspond to schema.org properties, and [precedence rules](../spec/spec-v0.1.md#precedence-and-conflict-resolution) that define how conflicts should be resolved.

Key points:
- AIDD fields take precedence for identity when conflicting with schema.org
- JSON-LD data can be merged with AIDD to provide additional context
- The optional `jsonld` field allows embedding full schema.org JSON-LD blocks
- `entity_type` values align with schema.org classes for easier translation

**Example**: If AIDD has `"name": "Acme Corporation"` and JSON-LD has `"name": "Acme Corp"`, use the AIDD value. If JSON-LD has additional fields like `foundingDate` or `address` that AIDD doesn't include, merge those into the final result.

See the [Interoperability section](../spec/spec-v0.1.md#interoperability-with-existing-structured-data-standards) in the spec for complete details and example scenarios.

### 1.2 Canonicalization guidance

- JSON keys MUST be strings; omit optional fields entirely instead of setting them to `null`.
- Whitespace (indentation, newlines) is irrelevant to validity. Consumers should validate structure, not formatting.
- Implementations MUST NOT reorder keys when relaying payloads unless they regenerate JSON from source data.
- Preserve URLs exactly as provided—including trailing slashes, query parameters, and fragments.
- Reject payloads containing extra top-level properties beyond those defined in v0.1.1 (backward-compatible with v0.1).

---

## 2. Publishing workflow

The standard relies on two distribution channels that every domain already controls: DNS and HTTPS.

### 2.1 DNS TXT record

Publish a TXT record at `_ai.<domain>` containing `ai-json=<base64-encoded-json>`. Example:

```
_ai.example.com TXT ("ai-json=eyJzcGVjIjoi...snip...In0=")
```

Key considerations:

- Encode the compact JSON representation, not a prettified version. Minify and remove trailing newline characters before encoding.
- Use the standard Base64 alphabet (RFC 4648) over the UTF-8 JSON bytes. Do not use the URL-safe variant and do not introduce line breaks.
- If the Base64 string exceeds 255 characters (common for longer descriptions), split it across multiple quoted substrings. The DNS server concatenates them automatically:

  ```
  _ai.example.com TXT ("ai-json=eyJzcGVjIjoi..." "c3RlcDEiLCJuYW1lIjoi..." "c3RlcTIifQ==")
  ```
- Keep the value under 4 KB to avoid DNS truncation. The base schema easily fits within this limit.
- For multi-string DNS entries, maintainer tools must concatenate segments before removing the `ai-json=` prefix.

DNS distribution makes the data accessible even if the HTTPS endpoint is unavailable. It also lets resolvers work without relying on web hosting (e.g., for parked domains or edge deployments).

### 2.2 HTTPS `.well-known/domain-profile.json`

Serve the plain JSON document at `https://<domain>/.well-known/domain-profile.json` with `Content-Type: application/json; charset=utf-8`.

- The `.well-known` path is already recognized by search engines and identity providers.
- Hosting the JSON over HTTPS removes size limitations and simplifies debugging.
- Ensure caching respects your update cadence. A modest `Cache-Control: public, max-age=300` balance works well.

The standard encourages publishing both DNS and HTTPS endpoints. Well-behaved consumers attempt `/.well-known/domain-profile.json` first for clarity, then fall back to DNS. Implementations can document their precedence.

### 2.3 Resolution precedence

All resolvers targeting v0.1.1 (backward-compatible with v0.1) MUST follow this order:

1. Fetch `https://<domain>/.well-known/domain-profile.json` over HTTPS.
2. If the HTTPS resource is unavailable, returns a non-success status, or fails schema validation, query the `_ai.<domain>` TXT record.
3. If both channels fail, treat the domain as having no AI Domain Data record.
4. If both channels respond but contain conflicting payloads, the HTTPS payload is authoritative for v0.1.1 (backward-compatible with v0.1). DNS is considered a fallback cache and should only be trusted when HTTPS is missing.

---

## 3. Tooling included in the v0.1.1 rollout

### 3.1 AI Record Generator (`/generator`)

A client-side React tool that:

- Provides form fields for every schema property.
- Validates required inputs in real time.
- Renders a pretty-printed JSON preview.
- Generates the Base64 payload and the full DNS TXT record.
- Offers copy buttons for both the JSON and the DNS value.

No network calls or persistence occur. Everything runs locally in the browser so anyone can use it without authentication.

### 3.2 AI Visibility Checker (`/checker`)

The checker accepts a domain and performs two fetches:

1. `https://<domain>/.well-known/domain-profile.json`
2. DNS TXT lookup for `_ai.<domain>`

It reports whether each source is present, whether the payload parses, and whether it validates against `schema-v0.1.json`. The tool highlights the source used for validation and surfaces raw JSON to aid debugging. Because DNS queries vary across environments, the checker handles common failures gracefully and reports diagnostics.

### 3.3 CLI (`packages/cli` – `aidd`)

The Node-based CLI includes three commands:

- `aidd init` – writes a starter `domain-profile.json` file populated with placeholders and the optional `entity_type` commented out for guidance.
- `aidd validate` – validates an existing file against the schema, exiting with code `0` on success and non-zero on failure.
- `aidd emit` – validates, then prints the recommended DNS TXT payload and `.well-known` JSON, ready for copy/paste.

The CLI uses the shared schema file to avoid drift and is dependency-light so it can run in constrained CI environments.

### 3.4 Resolver SDK (`packages/resolver`)

The TypeScript helper exposes:

```ts
const result = await resolveAIDomainData(domain: string);
```

Internally it:

1. Fetches the HTTPS payload (with configurable timeouts).
2. Queries DNS TXT using Node’s resolver or a provided custom resolver.
3. Picks the best source following the library’s precedence rules.
4. Validates against `schema-v0.1.json`.
5. Returns `{ source, valid, payload, errors }`.

Tool builders can plug this into their products without reimplementing the lookup dance.

---

## 4. Integration roadmap (preview)

Once the core spec gains traction, Phase 4 introduces optional ecosystem helpers:

- **WordPress plugin** – [Available now](https://wordpress.org/plugins/ai-domain-data/). Admin UI that serves the JSON file via REST API and prints DNS instructions.
- **GitHub Action** – [Available now](https://github.com/ai-domain-data/ai-domain-data-validate-action). Use `ai-domain-data-validate-action` in CI to run `aidd validate` automatically:

  ```yaml
  - uses: ai-domain-data/ai-domain-data-validate-action@v0.1.1
    with:
      path: domain-profile.json
  ```
- **Cloudflare Worker template** – CDN-ready `.well-known/domain-profile.json` service backed by KV.

These tools stay open-source and self-hosted. They exist to reduce friction, especially for non-technical teams, without forcing anyone into a centralized service.

---

## 5. Design principles

1. **Inclusive by default** – Every domain type is welcome. Language intentionally says “site,” “publisher,” or “domain owner,” never “business” only. `entity_type` remains optional but encouraged for analytics and filtering.
2. **Self-hosted first** – Implementation requires only DNS and HTTPS access you already control.
3. **Minimal moving parts** – No signing, key management, DNSSEC, or analytics in this version. Future iterations may add optional layers, but the core must stay approachable.
4. **Versioned evolution** – Each spec revision changes the `spec` string and ships with updated schema + docs. Consumers can support multiple versions during migrations.
5. **Interoperability** – The schema’s compact surface area makes it easy for AI tool vendors to ingest and for developers to integrate across languages.

---

## 6. Implementation checklist

1. Clone the repository (`git clone git@github.com:...`).
2. Install dependencies (`pnpm install` or `npm install`).
3. Run `pnpm dev --filter site` (or equivalent) to start the generator/checker.
4. Build your `domain-profile.json` file using the generator or CLI.
5. Publish DNS + HTTPS endpoints.
6. Share the repo/spec with partner teams, agencies, or community members for feedback.

---

## 7. Suggested validation flow for platform partners

1. **Automated discovery** – Given a domain, first attempt HTTPS fetch, then DNS query. Cache results with moderate TTL (5–15 minutes) to respect updates. If both sources respond, treat HTTPS as authoritative for v0.1.1 (backward-compatible with v0.1).
2. **Schema validation** – Reject records that do not match `schema-v0.1.json`. Provide actionable error messages when fields are missing or URLs are malformed.
3. **Payload usage** – Use the data for identity and linking surfaces. Do not treat it as a comprehensive content feed—future spec versions or extensions may cover posts, feeds, or structured offers.
4. **User overrides** – Allow platform users to re-run validation after updating their records to confirm AI surfaces stay in sync.

---

## 8. Looking ahead

Feedback from this v0.1.1 cycle (backward-compatible with v0.1) will determine what the next spec revision prioritizes—more entity metadata, social proofs, content references, or verification flows. The open standard remains free to implement independently.

---

## 8.1 Security considerations

- v0.1.1 payloads (backward-compatible with v0.1) are public-facing. Do not include secrets or unpublished contact channels.
- Integrity is best-effort only. Attackers with network control can spoof DNS or intercept HTTP. Future versions may introduce signatures or DNSSEC guidance to harden delivery.
- Encourage resolvers and client libraries to prioritize HTTPS fetches and enforce HSTS on publisher domains to mitigate downgrade attacks.
- DNS TXT records are vulnerable to poisoning; clients should validate the schema on every retrieval and compare HTTP vs DNS results before trusting content.

---

## 9. Get involved

- **Domain owners** – Publish your record, then share results. Seeing diverse `entity_type` usage (blogs, nonprofits, OSS projects) helps shape future guidance.
- **Platform builders** – Integrate the resolver SDK or schema into your AI ingestion pipelines and report edge cases.
- **Agencies and SEOs** – Add AI Domain Data checks to your onboarding audits. The standard pairs naturally with schema.org, Open Graph, and other metadata best practices.
- **Researchers** – Evaluate how AI systems respond after authoritative data appears. Document improvements and remaining gaps.

This is a collaborative standard. Open issues, suggest improvements, and help spread the word so AI systems can represent the full spectrum of domains accurately and respectfully.

