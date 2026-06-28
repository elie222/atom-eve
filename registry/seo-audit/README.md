# SEO Audit Agent

The SEO Audit Agent reviews this project's configured site, finds practical SEO and content fixes, and tracks progress week to week.

## What it does

It audits a configured URL or sitemap, reports SEO and content issues, and uses prior history when available to show what changed since the last run.

## What it checks

- Titles, meta descriptions, headings, canonical tags, and robots signals.
- Broken content, unclear CTAs, thin pages, and confusing conversion paths.
- Content gaps, internal-link opportunities, and visible copy quality.
- Previous-vs-current deltas when SEO memory is available.

It runs read-only. It does not submit forms, mutate the site, add paid APIs, or install a custom browser wrapper.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add seo-audit --target eve
```

or:

```bash
npx atom-eve add seo-audit --target flue
```

## Setup

No credentials are required for public pages.

Before enabling a recurring run, configure the production URL or sitemap in the installed schedule or workflow:

```text
agent/schedules/weekly.ts
src/workflows/seo-audit-weekly.ts
```

If no URL or sitemap is configured, the agent should report that the run is blocked instead of auditing a sample domain.

Make sure the runtime can fetch the site. Browser access is optional, but useful for visible copy, layout, and CTA checks. For private sites, configure authenticated fetch or browser session handling in your app repo and do not commit credentials.

## Memory

SEO memory is optional but recommended for recurring audits. When available, the agent reads prior history before auditing and saves the current report plus compact findings after auditing.

Eve installs include SEO memory tools backed by Vercel Blob and declare `@vercel/blob` as a dependency. Connect a Vercel Blob store if you want durable memory across runs. Other targets can wire a durable object store or use local files under `reports/seo-audit` when the runtime filesystem persists.

The memory system does not require SQL tables or migrations.

## Usage

Audit a sitemap:

```text
Audit https://your-site.com/sitemap.xml.

Sample up to 25 indexable URLs and compare against prior history if available.
```

Audit a single page:

```text
Audit https://your-site.com/pricing.

Check metadata, headings, canonical and robots signals, internal links, CTA clarity, visible copy quality, and content gaps.
```

The agent should return a concise Markdown report with an executive summary, scope, previous-vs-current deltas, findings ordered by severity, opportunities, next actions, and artifacts written.

## Connections and auth

- Public pages do not require credentials.
- Vercel Blob can be connected for Eve durable memory.
- Cloudflare R2 or another object store can be wired for Flue/custom durable memory.
- Private sites need authenticated fetch or browser session handling in the installed app. Do not commit credentials.

## Limitations

- Local file history may be lost in ephemeral sandboxes.
- It is not a search-engine-scale crawler. Keep sitemap samples bounded unless you add queueing and rate controls.
- JavaScript-heavy pages may need a browser-capable sandbox for reliable visible-copy and CTA checks.
- Robots and sitemap interpretation is best-effort and should be reviewed before making high-impact indexing changes.
