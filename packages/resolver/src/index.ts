import { Resolver } from "node:dns/promises";
import { setTimeout as delay } from "node:timers/promises";
import { createRequire } from "node:module";
import Ajv, { ErrorObject } from "ajv";
import addFormats from "ajv-formats";

const require = createRequire(import.meta.url);
const schema = require("../../spec/schema-v0.1.json");

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

const dnsResolver = new Resolver();

export type ResolveOptions = {
  /**
   * Custom fetch implementation (defaults to global fetch).
   */
  fetchImpl?: typeof fetch;
  /**
   * Override DNS TXT resolution. Return an array of TXT strings.
   */
  dnsLookup?: (record: string) => Promise<string[]>;
  /**
   * Abort signal forwarded to HTTP fetch requests.
   */
  signal?: AbortSignal;
  /**
   * Optional timeout applied to each network step in milliseconds.
   */
  timeoutMs?: number;
};

export type SourceState = {
  found: boolean;
  payload?: Record<string, unknown>;
  raw?: string;
  errors: string[];
};

export type ResolveResult = {
  source: "http" | "dns" | "none";
  valid: boolean;
  payload: Record<string, unknown> | null;
  errors?: string[];
  details: {
    http: SourceState;
    dns: SourceState;
  };
};

const specVersion = "https://ai-domain-data.org/spec/v0.1";

function normalizeErrors(errors: ErrorObject[] | null | undefined): string[] {
  if (!errors) {
    return [];
  }
  return errors.map((error) => {
    const path = error.instancePath || error.schemaPath || "payload";
    return `${path} ${error.message ?? "is invalid"}`.trim();
  });
}

function validateRecord(record: unknown): { valid: boolean; errors: string[] } {
  const valid = validateSchema(record);
  if (!valid) {
    return { valid: false, errors: normalizeErrors(validateSchema.errors) };
  }

  const payload = record as Record<string, unknown>;

  if (payload.spec !== specVersion) {
    return {
      valid: false,
      errors: [`spec must equal "${specVersion}"`]
    };
  }

  return { valid: true, errors: [] };
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs?: number,
  errorMessage = "Operation timed out"
): Promise<T> {
  if (!timeoutMs) {
    return promise;
  }

  let timeoutHandle: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutHandle = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs).unref();
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    clearTimeout(timeoutHandle!);
  }
}

async function defaultDnsLookup(record: string): Promise<string[]> {
  try {
    const results = await dnsResolver.resolveTxt(record);
    return results.map((segments) => segments.join(""));
  } catch {
    return [];
  }
}

async function fetchHttp(
  domain: string,
  options: ResolveOptions
): Promise<SourceState> {
  const fetcher = options.fetchImpl ?? globalThis.fetch;
  if (!fetcher) {
    return {
      found: false,
      errors: ["Global fetch is not available. Provide options.fetchImpl."]
    };
  }

  const url = `https://${domain}/.well-known/ai.json`;

  try {
    const response = await withTimeout(
      fetcher(url, {
        method: "GET",
        headers: { Accept: "application/json" },
        signal: options.signal,
        cache: "no-store"
      }),
      options.timeoutMs,
      "HTTP fetch timed out"
    );

    if (!response.ok) {
      return {
        found: false,
        errors: [`HTTP ${response.status} ${response.statusText}`]
      };
    }

    const text = await response.text();
    const parsed = JSON.parse(text) as Record<string, unknown>;
    const validation = validateRecord(parsed);

    return {
      found: true,
      payload: validation.valid ? parsed : undefined,
      raw: text,
      errors: validation.errors
    };
  } catch (error) {
    return {
      found: false,
      errors: [(error as Error).message]
    };
  }
}

function decodeBase64(encoded: string): string {
  return Buffer.from(encoded, "base64").toString("utf-8");
}

async function fetchDns(
  domain: string,
  options: ResolveOptions
): Promise<SourceState> {
  const lookup = options.dnsLookup ?? defaultDnsLookup;
  const name = `_ai.${domain}`;

  try {
    const records = await withTimeout(
      lookup(name),
      options.timeoutMs,
      "DNS lookup timed out"
    );

    if (!records.length) {
      return { found: false, errors: [] };
    }

    const payloadRecord = records.find((entry) => entry.startsWith("ai-json="));
    if (!payloadRecord) {
      return {
        found: false,
        errors: [
          `TXT record found at ${name} but missing ai-json= prefix.`
        ]
      };
    }

    const encoded = payloadRecord.replace(/^ai-json=/, "");
    const decoded = decodeBase64(encoded);
    const parsed = JSON.parse(decoded) as Record<string, unknown>;
    const validation = validateRecord(parsed);

    return {
      found: true,
      payload: validation.valid ? parsed : undefined,
      raw: decoded,
      errors: validation.errors
    };
  } catch (error) {
    return {
      found: false,
      errors: [(error as Error).message]
    };
  }
}

export async function resolveAIDomainData(
  domain: string,
  options: ResolveOptions = {}
): Promise<ResolveResult> {
  const normalizedDomain = domain.trim().toLowerCase();
  if (!normalizedDomain) {
    throw new Error("Domain cannot be empty.");
  }

  const [httpResult, dnsResult] = await Promise.all([
    fetchHttp(normalizedDomain, options),
    // slight staggering to avoid hammering DNS resolvers simultaneously
    (async () => {
      await delay(10);
      return fetchDns(normalizedDomain, options);
    })()
  ]);

  const sources: Array<["http" | "dns", SourceState]> = [
    ["http", httpResult],
    ["dns", dnsResult]
  ];

  let chosen: SourceState | undefined;
  let sourceKey: "http" | "dns" | "none" = "none";

  for (const [key, result] of sources) {
    if (result.found && result.payload) {
      chosen = result;
      sourceKey = key;
      break;
    }
  }

  if (!chosen) {
    // fall back to whichever source was detected even if invalid
    const available = sources.find(([, result]) => result.found);
    if (available) {
      sourceKey = available[0];
      chosen = available[1];
    }
  }

  return {
    source: sourceKey,
    valid: Boolean(chosen?.payload && chosen.errors.length === 0),
    payload: chosen?.payload ?? null,
    errors: chosen?.errors.length ? chosen.errors : undefined,
    details: {
      http: httpResult,
      dns: dnsResult
    }
  };
}

export const recommendedEntityTypes = [
  "business",
  "blog",
  "personal",
  "nonprofit",
  "community",
  "project",
  "publication",
  "tool",
  "other"
] as const;

