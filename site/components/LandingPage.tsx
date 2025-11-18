import { Link } from "react-router-dom";
import { FAQ } from "./FAQ";

export function LandingPage() {
  return (
    <div className="landing-page">
      <section className="hero">
        <div className="hero-content">
          <p className="meta-pill">Open Standard • Vendor-Neutral • Self-Hosted</p>
          <h1>AI Domain Data Standard</h1>
          <p className="hero-subtitle">
            Publish authoritative, self-hosted identity data for any domain. 
            Give AI systems, search engines, and automated agents the canonical 
            information they need—without relying on a SaaS gatekeeper.
          </p>
          <div className="hero-actions">
            <Link to="/generator" className="button button-primary">
              Generate Your Record
            </Link>
            <Link to="/checker" className="button button-secondary">
              Check Visibility
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="features-grid">
          <div className="feature-card">
            <h3>Self-Hosted</h3>
            <p>
              Publish your domain profile as a simple JSON file at 
              <code>/.well-known/domain-profile.json</code> or via DNS TXT records. 
              No third-party services required.
            </p>
          </div>
          <div className="feature-card">
            <h3>Schema.org Compatible</h3>
            <p>
              Built on schema.org vocabulary for maximum interoperability. 
              Works seamlessly with existing structured data pipelines and tools.
            </p>
          </div>
          <div className="feature-card">
            <h3>Open & Standardized</h3>
            <p>
              Vendor-neutral specification with free, open-source tooling. 
              No lock-in, no fees, no gatekeepers.
            </p>
          </div>
          <div className="feature-card">
            <h3>Easy Integration</h3>
            <p>
              Simple JSON schema, clear documentation, and ready-to-use tools 
              for generators, validators, and resolvers.
            </p>
          </div>
        </div>
      </section>

      <section className="quick-start">
        <h2>Get Started in Minutes</h2>
        <div className="steps">
          <div className="step">
            <div className="step-content">
              <h3>Generate Your Record</h3>
              <p>
                Use our <Link to="/generator">online generator</Link> to create compliant 
                <code>domain-profile.json</code> files for any domain. The generator validates 
                all required fields (name, description, website, contact) and supports optional 
                fields like logo, entity_type, and JSON-LD. You can generate records for multiple 
                domains, preview the JSON output, and get ready-to-use DNS TXT record values.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-content">
              <h3>Publish Your Profile</h3>
              <p>
                Publish your domain profile using one or both methods. <strong>Recommended:</strong> 
                Host the JSON file at <code>https://yourdomain.com/.well-known/domain-profile.json</code> 
                for primary access. Additionally, publish via DNS TXT record at <code>_ai.yourdomain.com</code> 
                as a fallback. Both methods are supported, but HTTPS is authoritative—DNS serves as a 
                reliable backup for systems that can't access HTTPS endpoints.
              </p>
            </div>
          </div>
          <div className="step">
            <div className="step-content">
              <h3>Verify & Share</h3>
              <p>
                Use our <Link to="/checker">visibility checker</Link> to verify your record is 
                accessible via both HTTPS and DNS, validate it against the schema, and confirm 
                it's properly formatted. The checker will show you which source is being used, 
                display any validation errors, and provide a preview of your published record. 
                Once verified, your domain profile is ready for AI systems, search engines, and 
                automated agents to discover and use.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta">
        <h2>Ready to Get Started?</h2>
        <p>Create your domain profile in seconds with our free, open-source tools.</p>
        <div className="cta-actions">
          <Link to="/generator" className="button button-primary button-large">
            Generate Your Record
          </Link>
          <Link to="/spec" className="button button-secondary button-large">
            Read the Spec
          </Link>
        </div>
      </section>

      <FAQ />
    </div>
  );
}

