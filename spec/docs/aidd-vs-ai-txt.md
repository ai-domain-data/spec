# AIDD vs ai.txt: Understanding the Difference

The AI Domain Data Standard (AIDD) and `ai.txt` are both emerging standards for AI systems, but they serve fundamentally different purposes. This page clarifies their relationship and explains why both can—and should—coexist on the same domain.

## Quick Comparison

| Aspect | AIDD | ai.txt |
|--------|------|--------|
| **Purpose** | Identity metadata | Content-access permissions |
| **Content** | Verified domain facts (name, description, contact, etc.) | Crawling restrictions and access rules |
| **Pattern** | Similar to `security.txt` | Similar to `robots.txt` |
| **Format** | JSON | Plain text |
| **Location** | `/.well-known/domain-profile.json` | `/ai.txt` |
| **DNS Support** | Yes (`_ai.<domain>` TXT record) | No |
| **Primary Use Case** | "Who is this domain?" | "What can AI systems access?" |

## What is AIDD?

The AI Domain Data Standard provides **canonical identity information** about a domain. It answers questions like:

- What is the official name of this organization/project?
- What does this domain represent?
- How can AI systems contact the domain owner?
- What type of entity is this (Organization, Person, Project, etc.)?

AIDD is modeled after `security.txt`—a simple, self-hosted file that provides authoritative metadata. It's designed to be:

- **Self-hosted**: You control the data, no central authority
- **Machine-readable**: JSON format with schema validation
- **Discoverable**: Available via both HTTPS and DNS
- **Minimal**: Intentionally small surface area for easy adoption

**Example AIDD record:**
```json
{
  "spec": "https://ai-domain-data.org/spec/v0.1",
  "name": "Example Publisher",
  "description": "Independent news outlet",
  "website": "https://example.com",
  "contact": "editor@example.com",
  "entity_type": "Organization"
}
```

## What is ai.txt?

`ai.txt` is a proposed standard (similar to `robots.txt`) that defines **what content AI systems are allowed to access** and how they should crawl it. It answers questions like:

- Which pages can AI crawlers access?
- Are there rate limits or restrictions?
- What content should be excluded from AI training?
- Are there specific access rules for different AI systems?

`ai.txt` is modeled after `robots.txt`—a plain text file that provides crawling instructions. It's designed to:

- **Control access**: Define what AI systems can and cannot crawl
- **Set boundaries**: Establish rules for content usage
- **Provide instructions**: Guide AI crawlers on how to interact with the site

**Example ai.txt file:**
```
# ai.txt - AI Crawler Instructions
User-agent: *
Allow: /public/
Disallow: /private/
Disallow: /admin/

# Rate limiting
Crawl-delay: 10

# Contact for AI access questions
Contact: ai-access@example.com
```

## Why Both Can Coexist

AIDD and `ai.txt` serve **complementary purposes** and are designed to work together:

1. **Different Questions, Different Answers**
   - AIDD: "Who are you?" → Identity metadata
   - ai.txt: "What can I access?" → Access permissions

2. **Different Patterns**
   - AIDD follows the `security.txt` pattern (authoritative metadata)
   - ai.txt follows the `robots.txt` pattern (crawling instructions)

3. **No Conflicts**
   - They don't overlap in functionality
   - They don't compete for the same use case
   - They can both be present on the same domain without issues

## Complementary Use Cases

A typical domain might use both standards:

**Scenario: A news publication**

- **AIDD** (`/.well-known/domain-profile.json`): Provides canonical identity
  ```json
  {
    "name": "Example News",
    "description": "Independent journalism covering technology and policy",
    "contact": "editor@examplenews.com",
    "entity_type": "CreativeWork"
  }
  ```

- **ai.txt** (`/ai.txt`): Defines access rules
  ```
  User-agent: *
  Allow: /articles/
  Disallow: /subscription/
  Disallow: /admin/
  ```

Together, they provide:
- **Identity** (AIDD): AI systems know who the publisher is
- **Access rules** (ai.txt): AI systems know what they can crawl

## When to Use Which

**Use AIDD when you want to:**
- Provide canonical identity information
- Ensure AI systems have accurate facts about your domain
- Publish verified metadata (name, description, contact, etc.)
- Support both HTTPS and DNS discovery methods

**Use ai.txt when you want to:**
- Control what content AI crawlers can access
- Set crawling restrictions or rate limits
- Define access rules for different AI systems
- Provide instructions for AI crawlers

**Use both when you want to:**
- Provide complete information to AI systems (identity + access rules)
- Follow best practices for AI-friendly domains
- Maximize compatibility with different AI tools and crawlers

## Summary

AIDD and `ai.txt` are **not competitors**—they're **complementary standards** that solve different problems:

- **AIDD** = "Who are you?" (Identity metadata)
- **ai.txt** = "What can I access?" (Crawling permissions)

Both standards can and should coexist on domains that want to provide comprehensive information to AI systems. Using both gives AI tools the complete picture: authoritative identity data (AIDD) and clear access rules (ai.txt).

## Further Reading

- [AIDD Specification](../spec/spec-v0.1.md) - Complete specification for the AI Domain Data Standard
- [AIDD Introduction](./introduction.md) - Overview of why AIDD exists
- [ai.txt Proposal](https://aitxt.org/) - Official ai.txt specification (external link)

