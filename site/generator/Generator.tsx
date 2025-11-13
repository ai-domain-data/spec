import { FormEvent, useMemo, useState } from "react";
import { CopyButton } from "@components/CopyButton";

type FormValues = {
  name: string;
  description: string;
  website: string;
  logo: string;
  contact: string;
  entityType: string;
};

const specVersion = "https://ai-domain-data.org/spec/v0.1";

const ENTITY_TYPE_OPTIONS = [
  "",
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
  quotedSegments: string[];
} {
  const chunks = chunkString(base64Payload, 255);
  if (chunks.length === 0) {
    return { record: '_ai.example.com TXT ("ai-json=")', quotedSegments: ['"ai-json="'] };
  }

  const [first, ...rest] = chunks;
  const segments = [`"ai-json=${first}"`, ...rest.map((chunk) => `"${chunk}"`)];
  const record = `_ai.example.com TXT (${segments.join(" ")})`;
  return { record, quotedSegments: segments };
}

const initialValues: FormValues = {
  name: "",
  description: "",
  website: "",
  logo: "",
  contact: "",
  entityType: ""
};

type Errors = Partial<Record<keyof FormValues, string>>;

function validate(values: FormValues): Errors {
  const errors: Errors = {};
  const required: Array<keyof FormValues> = [
    "name",
    "description",
    "website",
    "logo",
    "contact"
  ];

  required.forEach((key) => {
    if (!values[key]?.trim()) {
      errors[key] = "Required field";
    }
  });

  const urlFields: Array<keyof FormValues> = ["website", "logo"];
  urlFields.forEach((key) => {
    const value = values[key]?.trim();
    if (value) {
      try {
        new URL(value);
      } catch {
        errors[key] = "Enter a valid URL (https://...)";
      }
    }
  });

  const contact = values.contact.trim();
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
      logo: values.logo.trim(),
      contact: values.contact.trim()
    } as Record<string, string>;

    if (values.entityType.trim()) {
      base.entity_type = values.entityType.trim();
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
    return formatDnsRecord(encoded);
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

  const handleChange = (field: keyof FormValues) => (value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));

    if (hasSubmitted) {
      setErrors((prev) => {
        const next = { ...prev };
        const updated = validate({ ...values, [field]: value });
        if (updated[field]) {
          next[field] = updated[field];
        } else {
          delete next[field];
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
          <label htmlFor="logo">Logo URL*</label>
          <input
            id="logo"
            type="url"
            inputMode="url"
            placeholder="https://example.com/logo.svg"
            value={values.logo}
            onChange={(event) => handleChange("logo")(event.target.value)}
            required
          />
          {errors.logo ? (
            <span className="error-text">{errors.logo}</span>
          ) : (
            <span className="helper-text">
              Public logo or image file accessible over HTTPS.
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
            <strong>JSON payload (for /.well-known/ai.json)</strong>
            <pre>{jsonString}</pre>
            <div className="actions">
              <CopyButton label="Copy JSON" value={jsonString} />
            </div>
          </div>

          <div className="output-block">
            <strong>DNS TXT record (for _ai.example.com)</strong>
            <p className="helper-text">
              Replace <code>example.com</code> with your domain when creating the
              record. If the payload spans 255 characters or more, DNS requires
              multiple quoted segments—already handled in this output.
            </p>
            <pre>{dnsValue.record}</pre>
            {dnsValue.quotedSegments.length > 1 && (
              <p className="helper-text">
                Some DNS providers copy segments individually. If prompted, paste
                each quoted string in order: {dnsValue.quotedSegments.join(" ")}.
              </p>
            )}
            <div className="actions">
              <CopyButton label="Copy DNS record" value={dnsValue.record} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

