# @ai-domain-data/resolver

Resolve AI Domain Data records via HTTPS and DNS, then validate them against the v0.1 schema.

```ts
import { resolveAIDomainData } from "@ai-domain-data/resolver";

const result = await resolveAIDomainData("example.com");

if (result.valid && result.payload) {
  console.log("Source:", result.source); // "http" | "dns"
  console.log("Payload:", result.payload);
} else {
  console.error(result.errors);
}
```

## Features

- Prefers HTTPS (`/.well-known/domain-profile.json`) with DNS (`_ai.<domain>`) fallback, treating HTTPS as authoritative when both exist.
- Uses Ajv and the project’s canonical `schema-v0.1.json`.
- Returns granular details per source for debugging.
- Supports custom DNS lookup and fetch implementations.
- Zero external network services—works in Node 18+ environments.

## Resolution order

The resolver enforces the official v0.1 precedence:

1. Fetch `https://<domain>/.well-known/domain-profile.json`.
2. If the HTTPS payload is unavailable or invalid, query `_ai.<domain>` via DNS TXT.
3. If both sources fail, return `source: "none"`.
4. If both sources respond with conflicting payloads, the HTTPS payload wins.

## API

### `resolveAIDomainData(domain, options?)`

| Parameter | Type | Description |
| --- | --- | --- |
| `domain` | `string` | Domain to resolve (e.g., `"example.com"`). |
| `options.fetchImpl` | `typeof fetch` | Custom fetch implementation. Defaults to global `fetch`. |
| `options.dnsLookup` | `(record: string) => Promise<string[]>` | Override DNS TXT resolution. Return full TXT strings. |
| `options.signal` | `AbortSignal` | Abort signal forwarded to HTTP fetch. |
| `options.timeoutMs` | `number` | Optional timeout applied to both HTTP and DNS steps. |

Returns a promise resolving to:

```ts
type ResolveResult = {
  source: "http" | "dns" | "none";
  valid: boolean;
  payload: Record<string, unknown> | null;
  errors?: string[];
  details: {
    http: SourceState;
    dns: SourceState;
  };
};
```

`SourceState` contains `{ found: boolean; payload?: Record<string, unknown>; raw?: string; errors: string[] }`.

Example result:

```jsonc
{
  "source": "http",
  "valid": true,
  "payload": {
    "spec": "https://ai-domain-data.org/spec/v0.1",
    "name": "Example Publisher",
    "description": "Archive of agency-ready resources for machines and AI",
    "website": "https://example.com",
    "contact": "https://example.com/contact",
    "entity_type": "CreativeWork",
    "jsonld": {
      "@context": "https://schema.org",
      "@type": "CreativeWork",
      "name": "Example Publisher",
      "url": "https://example.com",
      "description": "Archive of agency-ready resources for machines and AI"
    }
  },
  "details": {
    "http": {
      "found": true,
      "errors": [],
      "raw": "{\n  \"spec\": \"https://ai-domain-data.org/spec/v0.1\",\n  \"name\": \"Example Publisher\",\n  \"description\": \"Archive of agency-ready resources for machines and AI\",\n  \"website\": \"https://example.com\",\n  \"contact\": \"https://example.com/contact\",\n  \"entity_type\": \"publication\"\n}",
      "payload": {
        "spec": "https://ai-domain-data.org/spec/v0.1",
        "name": "Example Publisher",
        "description": "Archive of agency-ready resources for machines and AI",
        "website": "https://example.com",
        "contact": "https://example.com/contact",
        "entity_type": "CreativeWork",
        "jsonld": {
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          "name": "Example Publisher",
          "url": "https://example.com",
          "description": "Archive of agency-ready resources for machines and AI"
        }
      }
    },
    "dns": {
      "found": true,
      "errors": [],
      "raw": "{\n  \"spec\": \"https://ai-domain-data.org/spec/v0.1\",\n  \"name\": \"Example Publisher\",\n  \"description\": \"Archive of agency-ready resources for machines and AI\",\n  \"website\": \"https://example.com\",\n  \"contact\": \"https://example.com/contact\",\n  \"entity_type\": \"CreativeWork\"\n}",
      "payload": {
        "spec": "https://ai-domain-data.org/spec/v0.1",
        "name": "Example Publisher",
        "description": "Archive of agency-ready resources for machines and AI",
        "website": "https://example.com",
        "contact": "https://example.com/contact",
        "entity_type": "CreativeWork"
      }
    }
  }
}
```

## JSON-LD Support

The resolver fully supports the optional `jsonld` field for schema.org alignment. When present, the `jsonld` object is included in the resolved payload. The resolver validates that `jsonld` is an object (if provided) but does not validate the internal structure of the JSON-LD block—that is left to JSON-LD processors.

**Note on precedence**: According to the AIDD specification, AIDD identity fields (`name`, `description`, `website`, `logo`, `contact`) take precedence over values in the embedded `jsonld` field. The `jsonld` field serves as supplementary data for tools that require schema.org format. Consumers should merge AIDD identity fields with additional JSON-LD properties when processing the payload.

### `recommendedEntityTypes`

An array of recommended schema.org `@type` values (`Organization`, `Person`, `Blog`, `NGO`, `Community`, `Project`, `CreativeWork`, `SoftwareApplication`, `Thing`) for the optional `entity_type` field.

## Building

```bash
npm install
npm run build --workspace @ai-domain-data/resolver
```

This compiles TypeScript into `dist/`. Consumers should import from the package root; the `exports` map targets the compiled output.

