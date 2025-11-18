import { FormEvent, useState } from "react";
import { Buffer } from "buffer";
import { CopyButton } from "@components/CopyButton";

type ValidationResult = {
  valid: boolean;
  errors: string[];
};

type SourceState = {
  found: boolean;
  raw?: string;
  parsed?: Record<string, unknown>;
  validation?: ValidationResult;
};

type CheckerState = {
  http: SourceState;
  dns: SourceState;
  chosenSource: "http" | "dns" | "none";
};

const specVersion = "https://ai-domain-data.org/spec/v0.1";

const initialState: CheckerState = {
  http: { found: false },
  dns: { found: false },
  chosenSource: "none"
};

function decodeBase64(payload: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(payload, "base64").toString("utf-8");
  }
  const binary = window.atob(payload);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

function validatePayload(payload: unknown): ValidationResult {
  const errors: string[] = [];

  if (typeof payload !== "object" || payload === null || Array.isArray(payload)) {
    return { valid: false, errors: ["Payload must be a JSON object."] };
  }

  const record = payload as Record<string, unknown>;
  const requiredFields = ["spec", "name", "description", "website", "contact"];

  requiredFields.forEach((field) => {
    if (!(field in record)) {
      errors.push(`Missing required field: ${field}`);
      return;
    }
    if (typeof record[field] !== "string" || !(record[field] as string).trim()) {
      errors.push(`Field ${field} must be a non-empty string.`);
    }
  });

  if (record.spec !== specVersion) {
    errors.push(`spec must equal "${specVersion}".`);
  }

  const mustBeUrl = ["website", "logo"];
  mustBeUrl.forEach((field) => {
    const value = record[field];
    if (typeof value === "string") {
      try {
        new URL(value);
      } catch {
        errors.push(`Field ${field} must be a valid URL.`);
      }
    }
  });

  if (typeof record.contact === "string") {
    const contact = record.contact.trim();
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    let looksLikeUrl = false;
    try {
      new URL(contact);
      looksLikeUrl = true;
    } catch {
      looksLikeUrl = false;
    }
    if (!looksLikeEmail && !looksLikeUrl) {
      errors.push("contact must be a valid email or URL.");
    }
  }

  if ("entity_type" in record) {
    if (typeof record.entity_type !== "string") {
      errors.push("entity_type must be a string when provided.");
    } else {
      const validEntityTypes = [
        "Organization",
        "Person",
        "Blog",
        "NGO",
        "Community",
        "Project",
        "CreativeWork",
        "SoftwareApplication",
        "Thing"
      ];
      if (!validEntityTypes.includes(record.entity_type)) {
        errors.push(
          `entity_type must be a valid schema.org @type value. Valid values: ${validEntityTypes.join(", ")}. Received: "${record.entity_type}"`
        );
      }
    }
  }

  // Validate jsonld field if present
  if ("jsonld" in record) {
    if (typeof record.jsonld !== "object" || record.jsonld === null || Array.isArray(record.jsonld)) {
      errors.push("jsonld must be an object when provided.");
    } else {
      const jsonld = record.jsonld as Record<string, unknown>;
      
      // Check for @context
      if (!("@context" in jsonld)) {
        errors.push("jsonld must include @context field.");
      } else if (jsonld["@context"] !== "https://schema.org") {
        errors.push('jsonld @context must equal "https://schema.org".');
      }
      
      // Check for @type
      if (!("@type" in jsonld)) {
        errors.push("jsonld must include @type field.");
      } else if (typeof jsonld["@type"] !== "string" || !jsonld["@type"]) {
        errors.push("jsonld @type must be a non-empty string.");
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

async function fetchHttp(domain: string): Promise<SourceState> {
  const endpoint = `https://${domain}/.well-known/domain-profile.json`;
  try {
    const response = await fetch(endpoint, {
      headers: { Accept: "application/json" },
      cache: "no-store"
    });
    if (!response.ok) {
      return { found: false };
    }
    const text = await response.text();
    const parsed = JSON.parse(text) as Record<string, unknown>;
    return {
      found: true,
      raw: text,
      parsed,
      validation: validatePayload(parsed)
    };
  } catch (error) {
    console.error("HTTP fetch failed", error);
    return { found: false };
  }
}

async function fetchDns(domain: string): Promise<SourceState> {
  const name = `_ai.${domain}`;
  const resolverUrl = `https://dns.google/resolve?name=${encodeURIComponent(
    name
  )}&type=TXT`;

  try {
    const response = await fetch(resolverUrl, { cache: "no-store" });
    if (!response.ok) {
      return { found: false };
    }
    const data = (await response.json()) as {
      Answer?: Array<{ data: string }>;
    };

    const records = data.Answer?.map((entry) =>
      entry.data.replace(/^"|"$/g, "").replace(/\\"/g, '"')
    );
    if (!records || records.length === 0) {
      return { found: false };
    }

    const payloadRecord = records.find((entry) => entry.startsWith("ai-json="));
    if (!payloadRecord) {
      return { found: false };
    }

    const encoded = payloadRecord.replace(/^ai-json=/, "");
    const decoded = decodeBase64(encoded);
    const parsed = JSON.parse(decoded) as Record<string, unknown>;

    return {
      found: true,
      raw: decoded,
      parsed,
      validation: validatePayload(parsed)
    };
  } catch (error) {
    console.error("DNS lookup failed", error);
    return { found: false };
  }
}

export function Checker() {
  const [domain, setDomain] = useState("");
  const [state, setState] = useState<CheckerState>(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const trimmed = domain.trim().toLowerCase();
    if (!trimmed) {
      setError("Enter a domain to check.");
      return;
    }
    if (/\s/.test(trimmed)) {
      setError("Domains cannot contain spaces.");
      return;
    }

    setLoading(true);
    const [httpResult, dnsResult] = await Promise.all([
      fetchHttp(trimmed),
      fetchDns(trimmed)
    ]);

    let chosen: CheckerState["chosenSource"] = "none";
    if (httpResult.found && httpResult.validation?.valid) {
      chosen = "http";
    } else if (dnsResult.found && dnsResult.validation?.valid) {
      chosen = "dns";
    } else if (httpResult.found) {
      chosen = "http";
    } else if (dnsResult.found) {
      chosen = "dns";
    }

    setState({
      http: httpResult,
      dns: dnsResult,
      chosenSource: chosen
    });
    setLoading(false);
  };

  const renderStatus = (label: string, condition: boolean | null) => {
    let className = "status-pill neutral";
    let text = "Unknown";

    if (condition === true) {
      className = "status-pill success";
      text = "Yes";
    } else if (condition === false) {
      className = "status-pill error";
      text = "No";
    }

    return (
      <div>
        <strong>{label} </strong>
        <span className={className}>{text}</span>
      </div>
    );
  };

  return (
    <div className="card">
      <h2 className="section-title">AI Visibility Checker</h2>
      <p className="helper-text">
        Check whether a domain exposes AI Domain Data via HTTPS and DNS, and
        confirm the payload matches the v0.1.1 schema (backward-compatible with v0.1).
      </p>

      <form className="form-grid" onSubmit={handleSubmit}>
        <div className="form-field">
          <label htmlFor="domain">Domain</label>
          <input
            id="domain"
            placeholder="example.com"
            value={domain}
            onChange={(event) => setDomain(event.target.value)}
            required
          />
          <span className="helper-text">
            Enter the root domain without protocol (e.g., example.com).
          </span>
        </div>

        <div className="actions">
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? "Checking..." : "Check visibility"}
          </button>
          {state.chosenSource !== "none" && (
            <span className="status-pill neutral">
              Using {state.chosenSource.toUpperCase()} as best source
            </span>
          )}
        </div>
      </form>

      {error && <p className="error-text">{error}</p>}

      <div className="output-stack">
        {renderStatus(
          "Domain profile via HTTPS (/.well-known/domain-profile.json)?",
          state.http.found
        )}
        {renderStatus("AI metadata via DNS (_ai.<domain>)?", state.dns.found)}
        {renderStatus(
          "Schema valid?",
          state.chosenSource === "none"
            ? null
            : state[state.chosenSource].validation?.valid ?? false
        )}
        {(() => {
          const source = state.chosenSource !== "none" ? state[state.chosenSource] : null;
          const validation = source?.validation;
          if (validation && !validation.valid && validation.errors.length > 0) {
            return (
              <div style={{ marginTop: "0.5rem" }}>
                <strong>Validation errors:</strong>
                <ul className="inline-list" style={{ marginTop: "0.25rem" }}>
                  {validation.errors.map((error, idx) => (
                    <li key={idx} className="error-text">
                      {error}
                    </li>
                  ))}
                </ul>
              </div>
            );
          }
          return null;
        })()}
        <div>
          <strong>Source used for validation:</strong>{" "}
          <span className="status-pill neutral">
            {state.chosenSource.toUpperCase()}
          </span>
        </div>
        <p className="helper-text">
          If HTTPS keeps showing “No,” ensure your server allows cross-origin
          requests (e.g., add <code>Access-Control-Allow-Origin: *</code> or a
          specific origin) for <code>/.well-known/domain-profile.json</code>.
        </p>
      </div>

      {state.http.found && (
        <div className="output-block">
          <strong>HTTP payload preview</strong>
          {state.http.validation?.errors?.length ? (
            <ul className="inline-list">
              {state.http.validation.errors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="helper-text">
              Valid JSON detected at /.well-known/domain-profile.json.
            </p>
          )}
          {state.http.parsed && "jsonld" in state.http.parsed && (
            <p className="helper-text" style={{ marginTop: "0.5rem" }}>
              ✓ JSON-LD field detected. This record includes schema.org alignment for maximum compatibility.
            </p>
          )}
          {state.http.raw && <pre>{state.http.raw}</pre>}
          {state.http.raw && (
            <div className="actions">
              <CopyButton label="Copy HTTP JSON" value={state.http.raw} />
            </div>
          )}
        </div>
      )}

      {state.dns.found && (
        <div className="output-block">
          <strong>DNS payload preview</strong>
          {state.dns.validation?.errors?.length ? (
            <ul className="inline-list">
              {state.dns.validation.errors.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="helper-text">
              Valid JSON recovered from <code>_ai.{domain}</code>.
            </p>
          )}
          {state.dns.parsed && "jsonld" in state.dns.parsed && (
            <p className="helper-text" style={{ marginTop: "0.5rem" }}>
              ✓ JSON-LD field detected. This record includes schema.org alignment for maximum compatibility.
            </p>
          )}
          {state.dns.raw && <pre>{state.dns.raw}</pre>}
          {state.dns.raw && (
            <div className="actions">
              <CopyButton label="Copy DNS JSON" value={state.dns.raw} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

