# Competitor Analysis Agent

A browser-driven agent that reviews competitor sites and reports positioning, pricing, and messaging deltas.

## What it does

Reviews your configured competitor URLs (homepage, pricing, product, feature, docs, changelog, blog, CTA pages) and reports changes in positioning and message hierarchy, pricing and packaging, feature messaging and content, and CTA flow, plus notable deltas from prior runs. It is read-only: it observes and reports, grounding every material claim in an observed URL, screenshot, or prior-run comparison.

It uses fetch and sandbox commands for lightweight collection (HTTP status, HTML, title, meta, visible text) and drives a real browser (Agent Browser) in the eve sandbox for screenshots, dynamic pages, and CTA flow inspection. The capability is the browser and fetch; the LLM does the analysis.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add competitor-analysis
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built.

After installing, customize `agent/instructions.md` with your real competitors, the pages to review, your own positioning and market, and reporting preferences. It does not use paid search APIs.

## Usage

Run the agent on demand against competitor URLs, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent inspects each competitor's relevant pages, captures screenshots and artifacts, compares against prior runs in `reports/competitor-analysis/history` when available, and summarizes positioning, pricing, messaging, content, and CTA deltas.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default.

## Limitations

- Browser automation depends on `agent-browser` being available in the eve sandbox. If a page blocks automation, the agent records the blocker and continues with the remaining URLs.
- History comparison is only available when prior-run artifacts persist; an ephemeral sandbox establishes a baseline rather than reporting deltas.
- Screenshots and reports are session-local artifacts; wire them to your own storage if you need long-term history.
- It observes only public, configured competitor pages and does not use paid search or market-intelligence APIs.
