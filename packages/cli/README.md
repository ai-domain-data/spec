# AI Domain Data CLI (`aidd`)

Local-first tooling for the AI Domain Data Standard v0.1. The CLI helps you scaffold, validate, and publish `domain-profile.json` records without relying on any hosted service.

## Installation

```bash
npm install
npm run build --workspace @ai-domain-data/cli
```

You can also invoke the binary with `npx` directly from this repository:

```bash
npx @ai-domain-data/cli aidd --help
```

## Commands

### `aidd init`

Create a starter `domain-profile.json` in the current directory.

```
aidd init [--path=./domain-profile.json] [--force]
```

- `--path` (or `-p`) overrides the output location.
- `--force` overwrites the file if it already exists.

### `aidd validate`

Validate a `domain-profile.json` file against `schema-v0.1.json`. Returns exit code `0` on success.

```
aidd validate [--path=./domain-profile.json]
```

### `aidd emit`

Validate the record and print two ready-to-publish payloads:

- Pretty-printed JSON for `/.well-known/domain-profile.json`
- DNS TXT record for `_ai.<domain>` with 255-character-safe Base64 segmentation

```
aidd emit [--path=./domain-profile.json]
```

Save the JSON output to `https://<domain>/.well-known/domain-profile.json` and optionally mirror it via `_ai.<domain>` TXT with `ai-json=<base64(JSON)>`.

The emitted DNS record is already split into quoted chunks of at most 255 characters, so you can paste it directly into providers that expect segmented TXT inputs.

## Requirements

- Node.js 18.17+ (ESM support + fetch API)
- Access to the repository’s `spec/schema-v0.1.json` file (used for validation)

## Notes

- The CLI never makes network calls. Everything runs locally.
- `entity_type` is optional; SHOULD use schema.org `@type` values (Organization, Person, Blog, NGO, Community, Project, CreativeWork, SoftwareApplication, Thing) or omit it entirely.
- Future versions of the standard will ship new schema files—update your `domain-profile.json` and rerun `aidd validate` when you migrate.

