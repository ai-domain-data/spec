# AI Domain Data CLI (`aidd`)

Local-first tooling for the AI Domain Data Standard v0.1. The CLI helps you scaffold, validate, and publish `ai.json` records without relying on any hosted service.

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

Create a starter `ai.json` in the current directory.

```
aidd init [--path=./ai.json] [--force]
```

- `--path` (or `-p`) overrides the output location.
- `--force` overwrites the file if it already exists.

### `aidd validate`

Validate an `ai.json` file against `schema-v0.1.json`. Returns exit code `0` on success.

```
aidd validate [--path=./ai.json]
```

### `aidd emit`

Validate the record and print two ready-to-publish payloads:

- Pretty-printed JSON for `/.well-known/ai.json`
- DNS TXT record for `_ai.<domain>` with 255-character-safe Base64 segmentation

```
aidd emit [--path=./ai.json]
```

The emitted DNS record is already split into quoted chunks of at most 255 characters, so you can paste it directly into providers that expect segmented TXT inputs.

## Requirements

- Node.js 18.17+ (ESM support + fetch API)
- Access to the repository’s `spec/schema-v0.1.json` file (used for validation)

## Notes

- The CLI never makes network calls. Everything runs locally.
- `entity_type` is optional; pick a recommended value or omit it entirely.
- Future versions of the standard will ship new schema files—update your `ai.json` and rerun `aidd validate` when you migrate.

