import { useEffect } from "react";

const faqs = [
  {
    question: "What is the AI Domain Data Standard?",
    answer: "The AI Domain Data Standard (AIDD) is an open, vendor-neutral specification that allows domain owners to publish authoritative identity data about their domain. It's a simple JSON file that can be hosted at `/.well-known/domain-profile.json` or published via DNS TXT records, giving AI systems, search engines, and automated agents canonical information about your domain without requiring any third-party services or SaaS dependencies."
  },
  {
    question: "Why do I need AI Domain Data?",
    answer: "As AI systems and automated agents increasingly crawl and interact with websites, having a standardized, authoritative source of domain identity information helps ensure accurate representation of your brand, organization, or project. It eliminates ambiguity, reduces errors in AI-generated content, and provides a single source of truth that you control."
  },
  {
    question: "How is this different from robots.txt or sitemap.xml?",
    answer: "robots.txt tells crawlers what NOT to access, and sitemap.xml helps them discover pages. AI Domain Data tells them WHO you are, your name, description, contact information, and entity type. It's complementary to these existing standards, focusing specifically on domain identity rather than site structure or crawl permissions."
  },
  {
    question: "Do I need to use both HTTPS and DNS methods?",
    answer: "No, but it's recommended. HTTPS (hosting at `/.well-known/domain-profile.json`) is the primary method and is authoritative. DNS (publishing via `_ai.<domain>` TXT record) serves as a reliable fallback for systems that can't access HTTPS endpoints. Using both ensures maximum compatibility and availability."
  },
  {
    question: "Is this compatible with schema.org?",
    answer: "Yes! The standard is built on schema.org vocabulary. The optional `entity_type` field uses schema.org `@type` values directly (like Organization, Person, Blog, etc.), and the optional `jsonld` field allows you to embed full schema.org JSON-LD blocks. This ensures seamless interoperability with existing structured data pipelines."
  },
  {
    question: "What happens if I don't publish AI Domain Data?",
    answer: "Nothing negative, it's completely optional. However, without it, AI systems and automated agents will need to infer your domain's identity from other sources (like your website content, meta tags, or third-party databases), which may be outdated, inaccurate, or incomplete. Publishing AI Domain Data gives you control over how your domain is represented."
  },
  {
    question: "Can I use this for multiple domains?",
    answer: "Yes! Each domain can have its own `domain-profile.json` file. The standard is designed to be domain-specific, so you'll need to publish a separate record for each domain you want to represent. The generator tool can help you create records for multiple domains."
  },
  {
    question: "How do I validate my AI Domain Data record?",
    answer: "Use our free visibility checker tool at `/checker`. It will fetch your record from both HTTPS and DNS sources, validate it against the JSON schema, check for required fields, and display any errors. You can also use the CLI tool (`aidd validate`) or validate against the schema directly at `https://ai-domain-data.org/spec/schema-v0.1.json`."
  },
  {
    question: "Is there a cost to use AI Domain Data?",
    answer: "No, it's completely free and open source. The specification is vendor-neutral with no licensing fees, and all tooling (generator, checker, CLI, resolver SDK) is open source. You host your own data. There are no third-party services or SaaS dependencies required."
  },
  {
    question: "What if I need to update my domain profile?",
    answer: "Simply update the JSON file at `/.well-known/domain-profile.json` and/or the DNS TXT record. Changes take effect immediately for HTTPS (once your server serves the updated file) and within DNS propagation time (typically minutes to hours) for DNS records. There is no versioning or migration process required—just update the file."
  },
  {
    question: "Can plugins or CMS platforms add support for this?",
    answer: "Absolutely! The standard is designed for easy integration. WordPress, Drupal, and other CMS platforms can add one-click support to generate and publish `domain-profile.json` files. See our Integrator Quickstart guide for implementation details, field mappings, and best practices for plugin authors."
  },
  {
    question: "How does this relate to ai.txt?",
    answer: "ai.txt (similar to robots.txt) tells AI systems what content they can or cannot use. AI Domain Data tells them WHO you are. They're complementary standards that serve different purposes, ai.txt for content permissions, AI Domain Data for identity information. You can use both together."
  }
];

export function FAQ() {
  useEffect(() => {
    // Add JSON-LD structured data for FAQ schema
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify(faqSchema);
    script.id = "faq-structured-data";
    
    // Remove existing FAQ structured data if present
    const existing = document.getElementById("faq-structured-data");
    if (existing) {
      existing.remove();
    }
    
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById("faq-structured-data");
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, []);

  return (
    <section className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <details key={index} className="faq-item">
            <summary className="faq-question">
              {faq.question}
            </summary>
            <div className="faq-answer">
              <p>{faq.answer}</p>
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}

