import { useState } from "react";
import { Generator } from "@generator/Generator";
import { Checker } from "@checker/Checker";

const tabs = [
  { id: "generator", label: "Generator", component: <Generator /> },
  { id: "checker", label: "Visibility Checker", component: <Checker /> }
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>("generator");

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>AI Domain Data Tools</h1>
        <p>
          Publish and verify AI-ready data for your site, organization, or project.
          Use the generator to author your record, then confirm visibility with the
          checker before announcing adoption.
        </p>
      </header>

      <div className="tab-list" role="tablist">
        {tabs.map((tab) => (
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
        {tabs.map((tab) => (
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
    </div>
  );
}

