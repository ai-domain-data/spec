export function ContactPanel() {
  return (
    <div className="card contact-panel">
      <h2 className="section-title">Contact & Community</h2>
      <p className="helper-text">
        The AI Domain Data Standard is developed in the open, with feedback from domain owners, developers, and visibility/AI ecosystem providers.
        For questions, implementation details, or adoption feedback, use the channels below.
      </p>

      <div className="contact-grid">
        <div className="contact-card">
          <h3>Email</h3>
          <p>Standards &amp; Editorial Contact — clarifications, adoption feedback, invitations, or document questions.</p>
          <a href="mailto:dev@ascendingwebservices.com">dev@ascendingwebservices.com</a>
        </div>

        <div className="contact-card">
          <h3>GitHub</h3>
          <p>Specification discussion, issue reporting, proposals, and ecosystem integrations.</p>
          <a href="https://github.com/ai-domain-data/spec" target="_blank" rel="noreferrer">
            github.com/ai-domain-data/spec
          </a>
        </div>

        <div className="contact-card">
          <h3>Security</h3>
          <p>For sensitive or private security-related findings (e.g., resolver vulnerabilities or canonicalization inconsistencies), please use the dedicated security channel.</p>
          <a href="mailto:security@ai-domain-data.org">security@ascendingwebservices.org</a>
        </div>
      </div>

      <div className="info-callout">
        <p>We request that researchers use responsible disclosure practices and avoid posting sensitive details publicly.</p>
        <p>We aim to respond within 3 business days. When reaching out, please include:</p>
        <ul className="inline-list">
          <li>The domain you’re working with</li>
          <li>Your use case or implementation context</li>
          <li>Any tooling or resolver behavior you observed</li>
        </ul>
        <p>This helps guide future revisions of the standard and supporting ecosystem tools.</p>
      </div>
    </div>
  );
}
