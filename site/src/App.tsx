import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { Generator } from "@generator/Generator";
import { Checker } from "@checker/Checker";
import { SpecOverview } from "@components/SpecOverview";
import { SpecPage } from "@components/SpecPage";
import { ContactPanel } from "@components/ContactPanel";
import { LandingPage } from "@components/LandingPage";
import { Footer } from "@components/Footer";
import { Analytics } from "@vercel/analytics/react";

const versionMeta = {
  version: "v0.1.1",
  status: "Informational Draft",
  published: "2025-11-14",
  lastUpdated: "2025-11-18",
  specUrl: "https://github.com/ai-domain-data/spec",
  schemaUrl:
    "https://ai-domain-data.org/spec/schema-v0.1.json"
} as const;

function Nav() {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  return (
    <nav className="top-nav">
      <Link to="/" className="brand">
        AI Domain Data Standard
      </Link>
      <div className="nav-links">
        <Link
          to="/generator"
          className={`nav-link ${isActive("/generator") ? "active" : ""}`}
        >
          Generator
        </Link>
        <Link
          to="/checker"
          className={`nav-link ${isActive("/checker") ? "active" : ""}`}
        >
          Checker
        </Link>
        <Link
          to="/spec"
          className={`nav-link ${isActive("/spec") ? "active" : ""}`}
        >
          Spec
        </Link>
        <Link
          to="/contact"
          className={`nav-link ${isActive("/contact") ? "active" : ""}`}
        >
          Contact
        </Link>
      </div>
    </nav>
  );
}

function ToolsLayout() {
  const location = useLocation();
  const activeTab = location.pathname === "/checker" ? "checker" : "generator";

  return (
    <>
      <header className="app-header">
        <div>
          <p className="meta-pill">AI Domain Data Standard</p>
          <h1>Publish Canonical AI Metadata</h1>
          <p>
            Authoritative, self-hosted identity data for any domain. Generate your
            JSON record, validate DNS + HTTPS visibility, and reference the v0.1.1
            spec—all without relying on a SaaS gatekeeper.
          </p>
        </div>
        <div className="version-box">
          <span className="meta-label">Current version </span>
          <strong>{versionMeta.version}</strong>
          <p>
            {versionMeta.status} • Last updated {versionMeta.lastUpdated}
          </p>
        </div>
      </header>

      <div className="tab-list" role="tablist">
        <Link
          to="/generator"
          role="tab"
          className={`tab-button ${activeTab === "generator" ? "active" : ""}`}
          aria-selected={activeTab === "generator"}
        >
          Generator
        </Link>
        <Link
          to="/checker"
          role="tab"
          className={`tab-button ${activeTab === "checker" ? "active" : ""}`}
          aria-selected={activeTab === "checker"}
        >
          Visibility Checker
        </Link>
      </div>

      <section>
        {activeTab === "checker" ? <Checker /> : <Generator />}
      </section>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Nav />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/generator" element={<ToolsLayout />} />
          <Route path="/checker" element={<ToolsLayout />} />
          <Route
            path="/spec"
            element={
              <section className="standalone-section">
                <SpecOverview meta={versionMeta} />
              </section>
            }
          />
          <Route path="/spec/v0.1" element={<SpecPage />} />
          <Route
            path="/contact"
            element={
              <section className="standalone-section">
                <ContactPanel />
              </section>
            }
          />
        </Routes>
        <Footer />
      </div>
      <Analytics />
    </BrowserRouter>
  );
}

