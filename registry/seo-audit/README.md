# SEO Audit

A browser-driven SEO agent that writes a practical, severity-ordered report of content and metadata fixes.

## What it does

Audits a configured URL or sitemap for titles, meta descriptions, headings, canonical and robots signals, broken content, unclear CTAs, content gaps, internal-link opportunities, and visible copy quality.

It is read-only: it never submits forms, mutates the site, or uses paid APIs.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add seo-audit
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages.

After installing, customize `agent/instructions.md` with your site, product language, conversion goals, and reporting preferences. Set the production URL or sitemap in `agent/schedules/weekly.ts` before enabling the recurring run. If no URL or sitemap is configured, the agent reports that the run is blocked.

For private sites, configure authenticated fetch or an Agent Browser session/profile outside this package and do not commit credentials.

## Usage

Run the agent on demand with a target, or use the bundled weekly schedule (Mondays at 09:00 UTC).

Audit a sitemap:

```text
Audit https://your-site.com/sitemap.xml. Sample up to 25 indexable URLs.
```

Audit a single page:

```text
Audit https://your-site.com/pricing. Check metadata, headings, canonical and robots signals, internal links, CTA clarity, visible copy quality, and content gaps.
```

It returns a Markdown report with summary, scope, findings by severity, content and internal-link opportunities, next actions, and artifacts written.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation uses `agent-browser` in the Eve sandbox. For authenticated sites, provide your own browser session/profile and adapt the local instructions.

## Limitations

- If browser automation is unavailable, the agent continues with HTTP-based checks and calls out the limitation.
- There is no persistent history; save reports externally if you want previous-vs-current deltas.
- Keep sitemap samples bounded unless you add queueing and rate controls; it samples rather than crawling at search-engine scale.
- Review robots and sitemap interpretations before making high-impact indexing changes.
