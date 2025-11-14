# AI Domain Data Standard – Adoption Guide

This guide helps domain owners and communications teams publish AI Domain Data records in production. It focuses on rollout tasks, governance, and maintenance rather than low-level implementation.

---

## 1. Define scope and ownership

1. List every domain you plan to cover (primary site, subdomains, regional properties, campaign microsites).
2. Identify who controls DNS for each domain and who can deploy files to the origin/CDN.
3. Decide whether each domain will manage its own record or whether a parent brand will publish canonical data on their behalf.
4. Capture escalation contacts (marketing, SEO, legal/compliance).

---

## 2. Gather canonical identity data

Create a single source of truth for the schema fields:

| Field | Source of truth |
| --- | --- |
| name | Brand or legal entity registry |
| description | Approved messaging / SEO summary (1–2 sentences) |
| website | Canonical HTTPS URL |
| logo | CDN-hosted SVG/PNG consistent with brand usage |
| contact | Public support email or contact form |
| entity_type (optional) | Classification (business, blog, personal, nonprofit, etc.) |

Ensure stakeholders sign off on these values before publishing.

---

## 3. Generate the AI Domain Data record

Options:

- **AI Record Generator** – Web form with validation and copy-to-clipboard helpers.
- **CLI (`aidd init`)** – Generates a starter `ai.json` file you can track in source control.
- **Internal automation** – Integrate the schema into your CMS or metadata pipeline.

Requirements:

- spec MUST equal https://ai-domain-data.org/spec/v0.1.
- Optional fields should be omitted when unused.
- Additional properties are not allowed.

---

The AI Domain Data record is served at `https://<domain>/.well-known/domain-profile.json` and optionally mirrored in DNS at `_ai.<domain>` TXT with `ai-json=<base64(JSON)>`.

## 4. Publish via HTTPS (/.well-known/domain-profile.json)

1. Upload the JSON to your origin or CDN.
2. Serve it at https://<domain>/.well-known/domain-profile.json.
3. Set Content-Type: application/json; charset=utf-8.
4. Enforce HTTPS (HSTS recommended).
5. Use a conservative cache policy (e.g., Cache-Control: public, max-age=300).

If .well-known is not directly accessible, configure a rewrite or redirect to the canonical file.

---

## 5. Publish the DNS TXT variant

1. Minify the JSON (no whitespace/newlines).
2. Base64-encode the UTF-8 payload using the standard alphabet (no URL-safe variant).
3. Create a TXT record at _ai.<domain> with the value ai-json=<base64>.
4. Split long payloads into ≤255-character quoted segments.

Example:

`
_ai.example.com TXT ("ai-json=eyJzcGVjIjoi..." "c3RlcDEiLCJuYW1lIjoi..." "c3RlcTIifQ==")
`

Propagation time depends on your DNS provider’s TTL.

---

## 6. Validate before announcing adoption

- **AI Visibility Checker** – Confirms both sources, highlights the canonical payload, and flags schema issues.
- **CLI (`aidd validate`, `aidd emit`)** – Fits into CI/CD pipelines or release workflows.
- **Resolver SDK** – Integrate with monitoring/observability to watch for regressions.

Checklist:

1. HTTPS endpoint returns the intended JSON.
2. DNS TXT payload matches the HTTPS payload.
3. Both sources validate against schema-v0.1.json.

---

## 7. Communicate internally and externally

- Add AI Domain Data publishing to your metadata standards (e.g., same checklist as Open Graph, sitemaps, robots.txt).
- Notify partner teams, marketplaces, or AI tooling vendors that need trusted identity data.
- Encourage downstream systems (CRMs, chatbots, aggregators) to rely on AI Domain Data instead of scraping.

---

## 8. Maintain and monitor

| Task                                    | Frequency                      |
|-----------------------------------------|--------------------------------|
| Review identity fields/contact info     | Biannually or during rebrands  |
| Revalidate DNS + HTTPS endpoints        | Quarterly or after infra changes|
| Monitor github.com/ai-domain-data/spec| Subscribe to releases/issues   |

Store `ai.json` in source control or a CMS so revisions are auditable. When the spec publishes a new version, update the spec field and adopt any new requirements.

---

## 9. Support channels

- Standards/editorial questions: dev@ascendingwebservices.com
- Security-sensitive disclosures: security@ascendingwebservices.org
- Issues & proposals: https://github.com/ai-domain-data/spec

When reaching out, include:

1. The domain(s) you’re working with.
2. Your use case or implementation context.
3. Any resolver/tooling behavior you observed.

This context helps prioritize improvements for future versions and ecosystem tooling.
