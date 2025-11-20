import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";

export function SpecPage() {
  const [markdown, setMarkdown] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/spec/spec-v0.1.md")
      .then((res) => res.text())
      .then((text) => {
        setMarkdown(text);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load spec:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <section className="standalone-section">
        <div className="card">
          <p>Loading specification...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="standalone-section">
      <article className="spec-document">
        <ReactMarkdown
          components={{
            h1: ({ children }) => <h1 className="spec-title">{children}</h1>,
            h2: ({ children }) => <h2 className="spec-heading">{children}</h2>,
            h3: ({ children }) => <h3 className="spec-subheading">{children}</h3>,
            code: ({ children, className }) => {
              const isInline = !className;
              return isInline ? (
                <code className="inline-code">{children}</code>
              ) : (
                <code className="code-block">{children}</code>
              );
            },
            pre: ({ children }) => <pre className="spec-code-block">{children}</pre>,
            a: ({ href, children }) => (
              <a href={href} target="_blank" rel="noreferrer">
                {children}
              </a>
            ),
          }}
        >
          {markdown}
        </ReactMarkdown>
      </article>
    </section>
  );
}

