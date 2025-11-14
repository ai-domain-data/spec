type VersionMeta = {
  version: string;
  status: string;
  published: string;
  lastUpdated: string;
  specUrl: string;
  schemaUrl: string;
};

type SpecOverviewProps = {
  meta: VersionMeta;
};

export function SpecOverview({ meta }: SpecOverviewProps) {
  return (
    <div className="card spec-overview">
      <h2 className="section-title">
        AI Domain Data Standard — Specification Snapshot ({meta.version})
      </h2>

      <dl className="meta-definition">
        <div>
          <dt>Version</dt>
          <dd>{meta.version}</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{meta.status}</dd>
        </div>
        <div>
          <dt>Initial Publication</dt>
          <dd>{meta.published}</dd>
        </div>
        <div>
          <dt>Last Updated</dt>
          <dd>{meta.lastUpdated}</dd>
        </div>
      </dl>

      <p className="helper-text">
        The AI Domain Data Standard defines a simple, authoritative JSON document that any domain owner can publish to
        describe their identity to AI systems. The design is intentionally narrow—similar in spirit to{" "}
        <a href="https://www.rfc-editor.org/rfc/rfc9116" target="_blank" rel="noreferrer">
          RFC 9116 (security.txt)
        </a>
        —with a single canonical record that requires no SaaS dependencies and no vendor lock-in. Version {meta.version} is
        scoped strictly to identity fields and establishes the baseline structure and retrieval process for future extensions.
      </p>

      <section className="spec-section">
        <h3>Scope of v0.1</h3>
        <p>Identity fields included in this draft:</p>
        <ul className="inline-list columns">
          <li>name</li>
          <li>description</li>
          <li>website</li>
          <li>logo</li>
          <li>contact</li>
          <li>entity_type (optional)</li>
        </ul>
        <p>
          v0.1 is published as an Informational Draft. Future versions will follow the same versioned-document and public
          change-tracking model used here.
        </p>
      </section>

      <section className="spec-section">
        <h3>Resources</h3>
        <ul className="inline-list">
          <li>
            Specification Repository:{" "}
            <a href={meta.specUrl} target="_blank" rel="noreferrer">
              {meta.specUrl}
            </a>
          </li>
          <li>
            Download Schema (v0.1):{" "}
            <a href={meta.schemaUrl} target="_blank" rel="noreferrer">
              schema-v0.1.json
            </a>
          </li>
        </ul>
      </section>

      <section className="spec-section">
        <h3>Resolution Order</h3>
        <ol>
          <li>
            <strong>Primary Source:</strong> Retrieve <code>https://&lt;domain&gt;/.well-known/domain-profile.json</code>.
          </li>
          <li>
            <strong>Secondary Source:</strong> Query the DNS TXT record at <code>_ai.&lt;domain&gt;</code>.
          </li>
          <li>
            <strong>Authoritative Rule:</strong> When both sources exist, the HTTPS document served at{" "}
            <code>/.well-known/domain-profile.json</code> is authoritative.
          </li>
        </ol>
      </section>

      <section className="spec-section">
        <h3>Base64 &amp; Canonicalization Requirements</h3>
        <p>When publishing the DNS TXT variant, publishers MUST:</p>
        <ul className="inline-list">
          <li>Encode the UTF-8 JSON using the standard Base64 alphabet (no URL-safe variant).</li>
          <li>Not insert line breaks.</li>
          <li>Split TXT values at ≤255 characters.</li>
        </ul>
        <p>For both HTTPS and DNS variants:</p>
        <ul className="inline-list">
          <li>Omit optional fields when unused.</li>
          <li>Do not include additional, undefined properties.</li>
          <li>Preserve URLs exactly as provided (including trailing slashes).</li>
          <li>
            Resolvers MUST treat field values as canonical and SHOULD NOT rewrite whitespace or the organization of the JSON
            object aside from parsing.
          </li>
        </ul>
      </section>

      <section className="spec-section">
        <h3>Document Structure</h3>
        <ul className="inline-list">
          <li>Introduction &amp; Terminology</li>
          <li>JSON Schema and Field Definitions</li>
          <li>Publishing Instructions (HTTPS + DNS TXT)</li>
          <li>Resolution &amp; Validation Rules</li>
          <li>Canonicalization Requirements</li>
          <li>Security Considerations</li>
          <li>Appendix: Outreach Briefs &amp; Ecosystem Roadmap</li>
        </ul>
      </section>

      <section className="spec-section">
        <h3>Contributing</h3>
        <p>
          All discussion, proposals, and revisions are tracked publicly in the specification repository:{" "}
          <a href={meta.specUrl} target="_blank" rel="noreferrer">
            {meta.specUrl}
          </a>
          .
        </p>
        <p>
          Submit issues or pull requests referencing the affected section or schema version. Versioned drafts and change logs
          are maintained transparently.
        </p>
      </section>
    </div>
  );
}


