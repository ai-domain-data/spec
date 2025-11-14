import { useState } from "react";
import { Generator } from "@generator/Generator";
import { Checker } from "@checker/Checker";
import { SpecOverview } from "@components/SpecOverview";
import { ContactPanel } from "@components/ContactPanel";

const versionMeta = {
  version: "v0.1",
  status: "Informational Draft",
  published: "2025-11-14",
  lastUpdated: "2025-11-14",
  specUrl: "https://github.com/ai-domain-data/spec",
  schemaUrl:
    "https://raw.githubusercontent.com/ai-domain-data/spec/main/schema-v0.1.json"
} as const;

const toolTabs = [
  { id: "generator", label: "Generator", component: <Generator /> },
  { id: "checker", label: "Visibility Checker", component: <Checker /> }
] as const;

type ToolTabId = (typeof toolTabs)[number]["id"];
type View = "tools" | "spec" | "contact";

export default function App() {
  const [activeTab, setActiveTab] = useState<ToolTabId>("generator");
  const [view, setView] = useState<View>("tools");

  return (
    <div className="app-shell">
      <nav className="top-nav">
        <button className="brand" onClick={() => setView("tools")}>
          AI Domain Data Standard
        </button>
        <div className="nav-links">
          <button
            className={`nav-link ${view === "spec" ? "active" : ""}`}
            onClick={() => setView("spec")}
          >
            Spec
          </button>
          <button
            className={`nav-link ${view === "contact" ? "active" : ""}`}
            onClick={() => setView("contact")}
          >
            Contact
          </button>
        </div>
      </nav>

      {view === "tools" && (
        <>
          <header className="app-header">
            <div>
              <p className="meta-pill">AI Domain Data Standard</p>
              <h1>Publish Canonical AI Metadata</h1>
              <p>
                Authoritative, self-hosted identity data for any domain. Generate your
                JSON record, validate DNS + HTTPS visibility, and reference the v0.1
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
            {toolTabs.map((tab) => (
              <button
                key={tab.id}
                role="tab"
                className="tab-button"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <section>
            {toolTabs.map((tab) => (
              <div
                key={tab.id}
                role="tabpanel"
                hidden={activeTab !== tab.id}
                aria-labelledby={tab.id}
              >
                {tab.component}
              </div>
            ))}
          </section>
        </>
      )}

      {view === "spec" && (
        <section className="standalone-section">
          <SpecOverview meta={versionMeta} />
        </section>
      )}

      {view === "contact" && (
        <section className="standalone-section">
          <ContactPanel />
        </section>
      )}
    </div>
  );
}

