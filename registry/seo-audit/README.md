# SEO Audit Agent

## What it does

The SEO Audit Agent reviews a public website, page, or sitemap for practical SEO and content issues. It fetches pages, optionally opens key pages in a browser through the framework sandbox, compares the current run with local history, and returns or writes a concise Markdown report.

The package checks:

- Titles and meta descriptions.
- Heading structure.
- Canonical and robots signals.
- Broken content, broken CTAs, and unclear conversion paths.
- Content gaps and visible copy quality.
- Internal links and obvious broken-link risks.
- Previous-vs-current deltas from local history.

History is intentionally file-backed for the MVP. The agent writes snapshots and reports under `reports/seo-audit/history/...` in the sandbox or repo. DB-backed history, scheduled report retention, and cross-environment storage are future work.

The package includes:

- Shared SEO audit instructions.
- An Eve root agent, weekly schedule, and sandbox bootstrap for report/history directories.
- A Flue agent and weekly workflow prompt.

It does not add paid APIs or custom browser wrapper tools. The agent should use the target framework's native sandbox command, browser, and fetch capabilities where available.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add seo-audit --target flue
```

or:

```bash
npx atom-eve add seo-audit --target eve
```

## Setup

No credentials are required for public pages.

After installing, edit the scheduled prompt to include the URL or sitemap you want audited. The default weekly schedule uses a placeholder URL so it cannot accidentally audit the wrong site.

For Eve:

```text
agent/schedules/weekly.ts
```

For Flue:

```text
src/workflows/seo-audit-weekly.ts
```

Make sure the runtime sandbox can make outbound HTTP requests and write local files under `reports/seo-audit/history`. If browser inspection is available in your framework, use it for visible copy, layout, and CTA checks. If browser inspection is unavailable, continue with fetch-based checks and note the limitation in the report.

## Usage

Send the agent a URL or sitemap:

```text
Audit https://example.com/sitemap.xml.

Sample up to 25 indexable URLs, inspect homepage and top content pages in a browser if available, compare against prior history, and write the Markdown report to reports/seo-audit/latest.md.
```

For a single page:

```text
Audit https://example.com/pricing.

Check metadata, headings, canonical and robots signals, internal links, CTA clarity, visible copy quality, and content gaps. Compare with the previous run if history exists.
```

The agent should return a concise Markdown report and, when filesystem access is available, write:

```text
reports/seo-audit/latest.md
reports/seo-audit/history/YYYY-MM-DDTHH-mm-ssZ.md
reports/seo-audit/history/YYYY-MM-DDTHH-mm-ssZ.json
```

The JSON file should contain the lightweight observations needed for the next delta comparison, not raw page dumps.

## Local Smoke Test

Install into a fixture app and run type checks:

```bash
npx atom-eve init --target eve --runtime vercel
npx atom-eve add seo-audit --target eve
pnpm install
pnpm typecheck
```

Then send a safe prompt:

```text
Audit https://example.com. Keep the run read-only and write the report to reports/seo-audit/latest.md.
```

## Updating An Installed Copy

Rerun the add command from your app repo and review the diff:

```bash
npx atom-eve add seo-audit --target eve
git diff
```

Treat installed files like shadcn components: keep local URL, schedule, retention, and reporting customizations that still matter.

## Connections and auth

This package has no required connections and no required environment variables.

For private sites, configure authenticated fetch or browser session handling in your app repo. Do not commit cookies, browser profile state, or credentials.

## Limitations

- The MVP uses local file history under `reports/seo-audit/history`; DB-backed history is future work.
- It is not a crawler at search-engine scale. Keep sitemap samples bounded unless you add queueing and rate controls.
- JavaScript-heavy pages may need a browser-capable sandbox for reliable visible-copy and CTA checks.
- Robots and sitemap interpretation is best-effort and should be reviewed before making high-impact indexing changes.
