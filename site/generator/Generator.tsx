import { FormEvent, useMemo, useState } from "react";
import { Buffer } from "buffer";
import { CopyButton } from "@components/CopyButton";

type FormValues = {
  name: string;
  description: string;
  website: string;
  logo: string;
  contact: string;
  entityType: string;
  jsonldEnabled: boolean;
  jsonldType: string;
  jsonldEmail: string;
  jsonldAdditional: string;
};

const specVersion = "https://ai-domain-data.org/spec/v0.1";

const ENTITY_TYPE_OPTIONS = [
  "",
  "Organization",
  "Person",
  "Blog",
  "NGO",
  "Community",
  "Project",
  "CreativeWork",
  "SoftwareApplication",
  "Thing"
] as const;

function encodeBase64(input: string): string {
  if (typeof window === "undefined") {
    return Buffer.from(input, "utf-8").toString("base64");
  }
  const encoder = new TextEncoder();
  const bytes = encoder.encode(input);
  let binary = "";
  bytes.forEach((b) => {
    binary += String.fromCharCode(b);
  });
  return window.btoa(binary);
}

function chunkString(value: string, size: number): string[] {
  const chunks: string[] = [];
  for (let index = 0; index < value.length; index += size) {
    chunks.push(value.slice(index, index + size));
  }
  return chunks;
}

function formatDnsRecord(base64Payload: string): {
  record: string;
  segments: string[];
} {
  const chunks = chunkString(base64Payload, 255);
  if (chunks.length === 0) {
    return {
      record: "_ai.example.com TXT ai-json=",
      segments: ["ai-json="]
    };
  }

  const [first, ...rest] = chunks;
  const segments = [`ai-json=${first}`, ...rest];
  const record = `_ai.example.com TXT ${segments.join(" ")}`;
  return { record, segments };
}

const initialValues: FormValues = {
  name: "",
  description: "",
  website: "",
  logo: "",
  contact: "",
  entityType: "",
  jsonldEnabled: false,
  jsonldType: "",
  jsonldEmail: "",
  jsonldAdditional: ""
};

type Errors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): Errors {
  const errors: Errors = {};
  const required: Array<keyof FormValues> = [
    "name",
    "description",
    "website",
    "contact"
  ];

  required.forEach((key) => {
    const value = values[key];
    if (typeof value === "string" && !value.trim()) {
      errors[key] = "Required field";
    }
  });

  const urlFields: Array<keyof FormValues> = ["website", "logo"];
  urlFields.forEach((key) => {
    const value = values[key];
    if (typeof value === "string" && value.trim()) {
      try {
        new URL(value.trim());
      } catch {
        errors[key] = "Enter a valid URL (https://...)";
      }
    }
  });

  const contact = typeof values.contact === "string" ? values.contact.trim() : "";
  if (contact) {
    const looksLikeEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact);
    const looksLikeUrl = (() => {
      try {
        new URL(contact);
        return true;
      } catch {
        return false;
      }
    })();

    if (!looksLikeEmail && !looksLikeUrl) {
      errors.contact = "Enter a valid email or URL";
    }
  }

  // Validate additional JSON-LD fields if provided
  if (values.jsonldEnabled && typeof values.jsonldAdditional === "string" && values.jsonldAdditional.trim()) {
    try {
      JSON.parse(values.jsonldAdditional.trim());
    } catch {
      errors.jsonldAdditional = "Invalid JSON. Please check your syntax.";
    }
  }

  return errors;
}

export function Generator() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Errors>({});
  const [hasSubmitted, setHasSubmitted] = useState(false);

  const payload = useMemo(() => {
    const base = {
      spec: specVersion,
      name: values.name.trim(),
      description: values.description.trim(),
      website: values.website.trim(),
      contact: values.contact.trim()
    } as Record<string, string | object>;

    if (values.logo.trim()) {
      base.logo = values.logo.trim();
    }

    if (values.entityType.trim()) {
      base.entity_type = values.entityType.trim();
    }

    // Generate jsonld object if enabled
    if (values.jsonldEnabled) {
      const jsonld: Record<string, any> = {
        "@context": "https://schema.org",
        "@type": values.jsonldType.trim() || values.entityType.trim() || "Thing",
        name: values.name.trim(),
        url: values.website.trim(),
        description: values.description.trim()
      };

      if (values.logo.trim()) {
        jsonld.logo = values.logo.trim();
      }

      if (values.jsonldEmail.trim()) {
        jsonld.email = values.jsonldEmail.trim();
      } else if (values.contact.trim() && values.contact.trim().includes("@")) {
        // Auto-detect email from contact field
        jsonld.email = values.contact.trim();
      }

      // Parse additional JSON-LD fields if provided
      if (values.jsonldAdditional.trim()) {
        try {
          const additional = JSON.parse(values.jsonldAdditional.trim());
          Object.assign(jsonld, additional);
        } catch {
          // Invalid JSON, ignore
        }
      }

      base.jsonld = jsonld;
    }

    return base;
  }, [values]);

  const jsonString = useMemo(
    () => JSON.stringify(payload, null, 2),
    [payload]
  );

  const dnsValue = useMemo(() => {
    const compact = JSON.stringify(payload);
    const encoded = encodeBase64(compact);
    const formatted = formatDnsRecord(encoded);
    // Extract just the value part (without "_ai.example.com TXT " prefix) for copying
    const valueOnly = formatted.record.replace(/^_ai\.example\.com\s+TXT\s+/, "");
    return {
      ...formatted,
      valueOnly // Just the ai-json=... part for copying
    };
  }, [payload]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setHasSubmitted(true);
    const nextErrors = validate(values);
    setErrors(nextErrors);
  };

  const hasErrors = useMemo(
    () => Object.keys(errors).length > 0,
    [errors]
  );

  const handleChange = (field: keyof FormValues) => (value: string | boolean) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    if (hasSubmitted) {
      setErrors((prev) => {
        const next = { ...prev };
        const updated = validate({ ...values, [field]: value } as FormValues);
        if (updated[field as keyof FormValues]) {
          next[field as keyof FormValues] = updated[field as keyof FormValues];
        } else {
          delete next[field as keyof FormValues];
        }
        return next;
      });
    }
  };

  return (
    <div className="card">
      <h2 className="section-title">AI Record Generator</h2>
      <p className="helper-text">
        Provide canonical details about your site, organization, or project.
        Required fields ensure AI consumers receive consistent identity data.
      </p>

      <form className="form-grid" onSubmit={onSubmit} noValidate>
        <div className="form-field">
          <label htmlFor="name">Name*</label>
          <input
            id="name"
            value={values.name}
            onChange={(event) => handleChange("name")(event.target.value)}
            placeholder="Example: Pulse Weekly Newsletter"
            required
          />
          {errors.name ? (
            <span className="error-text">{errors.name}</span>
          ) : (
            <span className="helper-text">
              The name AI systems should quote when referencing you.
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="description">Description*</label>
          <textarea
            id="description"
            value={values.description}
            onChange={(event) => handleChange("description")(event.target.value)}
            placeholder="Concise statement about what the domain offers."
            required
          />
          {errors.description ? (
            <span className="error-text">{errors.description}</span>
          ) : (
            <span className="helper-text">
              Limit to 1–2 sentences that summarize your value.
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="website">Website URL*</label>
          <input
            id="website"
            type="url"
            inputMode="url"
            placeholder="https://example.com"
            value={values.website}
            onChange={(event) => handleChange("website")(event.target.value)}
            required
          />
          {errors.website ? (
            <span className="error-text">{errors.website}</span>
          ) : (
            <span className="helper-text">
              Primary canonical URL for the domain.
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="logo">Logo URL (optional)</label>
          <input
            id="logo"
            type="url"
            inputMode="url"
            placeholder="https://example.com/logo.svg"
            value={values.logo}
            onChange={(event) => handleChange("logo")(event.target.value)}
          />
          {errors.logo ? (
            <span className="error-text">{errors.logo}</span>
          ) : (
            <span className="helper-text">
              Public logo or image file accessible over HTTPS. Leave blank if your site doesn't have a logo.
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="contact">Contact*</label>
          <input
            id="contact"
            placeholder="support@example.com or https://example.com/contact"
            value={values.contact}
            onChange={(event) => handleChange("contact")(event.target.value)}
            required
          />
          {errors.contact ? (
            <span className="error-text">{errors.contact}</span>
          ) : (
            <span className="helper-text">
              Email address or contact URL you want AI systems to surface.
            </span>
          )}
        </div>

        <div className="form-field">
          <label htmlFor="entityType">Entity Type (optional)</label>
          <select
            id="entityType"
            value={values.entityType}
            onChange={(event) => handleChange("entityType")(event.target.value)}
          >
            {ENTITY_TYPE_OPTIONS.map((option) => (
              <option key={option || "empty"} value={option}>
                {option ? option : "Select a type (optional)"}
              </option>
            ))}
          </select>
          <span className="helper-text">
            Helps downstream tools categorize your domain. Leave blank if
            nothing fits.
          </span>
        </div>

        <div className="form-field">
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              id="jsonldEnabled"
              checked={values.jsonldEnabled}
              onChange={(event) => handleChange("jsonldEnabled")(event.target.checked)}
            />
            <label htmlFor="jsonldEnabled">
              Embed JSON-LD for schema.org alignment (optional)
            </label>
          </div>
          <span className="helper-text">
            Include a full schema.org JSON-LD block in your AIDD record. This provides maximum compatibility with tools that only process schema.org markup, while AIDD fields remain authoritative for identity.
          </span>
        </div>

        {values.jsonldEnabled && (
          <>
            <div className="form-field">
              <label htmlFor="jsonldType">JSON-LD @type (optional)</label>
              <select
                id="jsonldType"
                value={values.jsonldType}
                onChange={(event) => handleChange("jsonldType")(event.target.value)}
              >
                <option value="">Use Entity Type above (or default to Thing)</option>
                {ENTITY_TYPE_OPTIONS.filter(opt => opt).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <span className="helper-text">
                Schema.org type for the JSON-LD block. Defaults to Entity Type above if not specified.
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="jsonldEmail">JSON-LD Email (optional)</label>
              <input
                id="jsonldEmail"
                type="email"
                placeholder="contact@example.com"
                value={values.jsonldEmail}
                onChange={(event) => handleChange("jsonldEmail")(event.target.value)}
              />
              <span className="helper-text">
                Email for JSON-LD. If left blank, will use the Contact field if it's an email address.
              </span>
            </div>

            <div className="form-field">
              <label htmlFor="jsonldAdditional">Additional JSON-LD Fields (optional)</label>
              <textarea
                id="jsonldAdditional"
                placeholder='{"foundingDate": "2020-01-15", "address": {"@type": "PostalAddress", "addressLocality": "San Francisco"}}'
                value={values.jsonldAdditional}
                onChange={(event) => handleChange("jsonldAdditional")(event.target.value)}
                rows={4}
              />
              {errors.jsonldAdditional ? (
                <span className="error-text">{errors.jsonldAdditional}</span>
              ) : (
                <span className="helper-text">
                  Add extra schema.org fields as valid JSON. These will be merged into the JSON-LD block. Example: address, foundingDate, numberOfEmployees, etc.
                </span>
              )}
            </div>
          </>
        )}

        <div className="actions">
          <button className="primary-button" type="submit">
            Validate &amp; Generate
          </button>
          {hasSubmitted && !hasErrors && (
            <span className="status-pill success">Ready to publish</span>
          )}
          {hasSubmitted && hasErrors && (
            <span className="status-pill error">Fix the highlighted fields</span>
          )}
        </div>
      </form>

      {hasSubmitted && !hasErrors && (
        <div className="output-stack">
          <div className="output-block">
            <strong>JSON payload (for /.well-known/domain-profile.json)</strong>
            <pre>{jsonString}</pre>
            <div className="actions">
              <CopyButton label="Copy JSON" value={jsonString} />
            </div>
          </div>

          <div className="output-block">
            <strong>DNS TXT record</strong>
            <p className="helper-text">
              <strong>Record Type:</strong> TXT<br />
              <strong>Name:</strong> <code>_ai</code> (subdomain)<br />
              <strong>Value to paste:</strong> (shown below)
            </p>
            <div style={{ marginTop: "1rem" }}>
              <strong style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.875rem" }}>
                DNS Value (copy this):
              </strong>
              <pre>{dnsValue.valueOnly}</pre>
            </div>
            <p className="helper-text" style={{ marginTop: "1rem", fontSize: "0.875rem" }}>
              <strong>Note:</strong> When creating the DNS record, use <code>_ai</code> as the name/subdomain. 
              If the payload spans 255 characters or more, DNS requires multiple quoted segments—already handled in this output.
            </p>
            {dnsValue.segments.length > 1 && (
              <div className="helper-text" style={{ marginTop: "1rem" }}>
                <p style={{ margin: "0 0 0.5rem 0" }}>
                  Some DNS providers copy segments individually. If prompted, paste each value in order:
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {dnsValue.segments.map((segment, index) => (
                    <code key={segment} style={{ 
                      display: "block", 
                      padding: "0.5rem", 
                      background: "var(--color-bg-secondary)", 
                      borderRadius: "0.5rem",
                      wordBreak: "break-all",
                      overflowWrap: "anywhere",
                      fontSize: "0.875rem"
                    }}>
                      {index + 1}. {segment}
                    </code>
                  ))}
                </div>
              </div>
            )}
            <div className="actions">
              <CopyButton label="Copy DNS value" value={dnsValue.valueOnly} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

