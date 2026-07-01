# SEO Improver

## What it does

Improves your search rankings, week over week.

Each week it:
- reads where you rank (Google Search Console, plus DataForSEO for the competitive picture)
- ships one high-leverage fix per opportunity: striking-distance keywords, weak titles, cannibalization, decay
- checks whether last week's changes worked and keeps what wins

You get a rankings snapshot and a short report of this week's actions.

If your blog is on GitHub, it can open a pull request with the highest-confidence changes. It never pushes to your default branch and never merges.

## Setup

1. Create a Google service account, enable the Search Console API, add the service account as a user on your Search Console property, and give the agent its JSON key.
2. Create DataForSEO API credentials with SERP and Labs (ranked keywords) access.
3. Set your Search Console property, domain, and tracked keywords in `agent/instructions.md`.
4. Optional, to ship changes: if your blog is on GitHub, set the repo and content path in `agent/instructions.md` and give the agent a token with write access to it. Leave it unset to stay report-only; a blog on a hosted CMS needs your own publishing path.

History accumulates under `reports/seo-improver/`; keep it between runs, since the week-over-week diff depends on it.
