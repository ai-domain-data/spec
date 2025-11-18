import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>Tools</h3>
          <ul>
            <li><Link to="/generator">Record Generator</Link></li>
            <li><Link to="/checker">Visibility Checker</Link></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Documentation</h3>
          <ul>
            <li><Link to="/spec">Specification</Link></li>
            <li><a href="https://github.com/ai-domain-data/spec" target="_blank" rel="noopener noreferrer">GitHub Repository</a></li>
            <li><a href="https://ai-domain-data.org/spec/schema-v0.1.json" target="_blank" rel="noopener noreferrer">JSON Schema</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>Resources</h3>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
            <li><a href="https://github.com/ai-domain-data/spec/blob/main/spec/docs/integrator-quickstart.md" target="_blank" rel="noopener noreferrer">Integrator Guide</a></li>
            <li><a href="https://github.com/ai-domain-data/spec/blob/main/spec/docs/technical-guide-v0.1.md" target="_blank" rel="noopener noreferrer">Technical Guide</a></li>
          </ul>
        </div>
        <div className="footer-section">
          <h3>About</h3>
          <ul>
            <li>Version v0.1.1</li>
            <li>Open Standard</li>
            <li>MIT License</li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} AI Domain Data Standard. Open source and vendor-neutral.</p>
      </div>
    </footer>
  );
}

