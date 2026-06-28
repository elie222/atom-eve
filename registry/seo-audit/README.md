# SEO Audit Agent

A browser-driven SEO agent that audits the configured site and writes a practical, severity-ordered report of content and metadata fixes.

## What it does

Audits a configured URL or sitemap and reports SEO and content issues: titles and meta descriptions, headings, canonical and robots signals, broken content and unclear CTAs, content gaps, internal-link opportunities, and visible copy quality.

It drives a real browser (Agent Browser) in the eve sandbox via the built-in `bash` tool for visible copy, CTA, and rendered-page checks, and uses `curl`/`node`/`fetch` for headers and parsing. The capability is the browser and HTTP; the LLM does the SEO judgment. There is no hand-rolled crawler or custom browser wrapper tool. It runs read-only: it never submits forms, mutates the site, or adds paid APIs.

This run has no persistent history. It audits the current state of the site and writes its report to the session; wire your own storage if you want previous-vs-current deltas.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add seo-audit
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built.

After installing, customize `agent/instructions.md` with your real site, product language, conversion goals, and reporting preferences, and set the production URL or sitemap in `agent/schedules/weekly.ts` before enabling the recurring run. If no URL or sitemap is configured, the agent reports that the run is blocked instead of auditing a sample domain. For private sites, configure authenticated fetch or an Agent Browser session/profile outside this package and do not commit credentials.

## Usage

Run the agent on demand with a target, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically in task mode: eve starts the agent on its cron tick and the report lands in that run's session.

Audit a sitemap:

```text
Audit https://your-site.com/sitemap.xml. Sample up to 25 indexable URLs.
```

Audit a single page:

```text
Audit https://your-site.com/pricing. Check metadata, headings, canonical and robots signals, internal links, CTA clarity, visible copy quality, and content gaps.
```

The agent returns a concise Markdown report with an executive summary, scope and method, findings ordered by severity, content and internal-link opportunities, recommended next actions, and artifacts written. Screenshots and reports are session-local artifacts; wire the response to your own storage if you need persisted audit history.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default. For authenticated sites, create a browser session/profile manually outside this package and adapt the instructions.

## Limitations

- Browser automation depends on `agent-browser` being available in the eve sandbox. If it is unavailable, the agent continues with the remaining HTTP-based checks and calls out the limitation.
- There is no persistent history; each run audits the current state. Save reports externally if you want previous-vs-current deltas.
- It is not a search-engine-scale crawler. Keep sitemap samples bounded unless you add queueing and rate controls.
- Robots and sitemap interpretation is best-effort and should be reviewed before making high-impact indexing changes.
