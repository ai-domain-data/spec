# Help AI Get Your Domain Right

AI assistants now sit between you and your audience. Whether you run a newsletter, a nonprofit, a community project, or a fast-growing product, people rely on AI summaries to understand who you are and what you offer. When the data feeding those assistants is outdated, incomplete, or simply wrong, you lose trust, traffic, and opportunities.

The AI Domain Data Standard offers a simple fix. It gives every domain owner a lightweight way to publish verified facts in a format AI tools can read immediately. No subscription, no complicated setup, no central gatekeeper—just clear, canonical information you control.

## Why it matters

- **AI accuracy is the new SEO.** Search still matters, but AI answers are increasingly the first touchpoint for customers, readers, and fans. Supplying your own official data creates a trustworthy baseline for every assistant.
- **Works for every kind of domain.** Blogs, personal sites, open-source projects, nonprofits, startups, agencies—if you have a domain, the standard works for you.
- **Fast to implement.** The JSON file covers your name, description, official website, contact point, and optional fields like logo and category (e.g., "blog" or "community"). You can publish it in minutes.
- **Self-hosted by design.** You add a DNS TXT record and a `.well-known/domain-profile.json` file. Agents retrieve the data directly from you, not from another platform that might disappear or paywall access.

## How you’ll use it

1. Fill out a short form in the AI Record Generator (included in this project) to create your JSON file.
2. Copy the suggested DNS record and `.well-known` file contents. If the DNS payload looks long, split it into multiple quoted strings—your DNS provider will concatenate them automatically.
3. Publish them using your registrar or hosting tools.
4. Run the AI Visibility Checker to confirm everything resolves correctly.

That’s it. From there, AI tools have a base set of facts to reference—provided straight from the source.

## What’s next

The standard is intentionally minimal for v0.1 so it’s easy to adopt. As more domains participate, we’ll collaborate with community partners, agencies, and platforms to expand the ecosystem: a WordPress plugin, GitHub Action, Cloudflare Worker, and light developer tooling are already on the roadmap.

Down the road, you’ll see optional services that add automation, signing, and analytics. But the core standard will stay open, free, and self-hosted—ensuring you always have an independent way to represent your domain accurately.

Join the early adopters bringing “AI Optimization” (AIO) into everyday marketing and communications. Publish your AI Domain Data record, share it with your peers, and help AI get your domain right.***

