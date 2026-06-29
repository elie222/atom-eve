# Competitor Analysis Agent

A browser-driven agent that reviews competitor sites for positioning, pricing, and messaging changes.

## What it does

Reviews configured competitor pages such as homepages, pricing, product pages, docs, changelogs, blogs, and CTA flows. It reports changes in positioning, pricing, packaging, feature messaging, content, and CTA flow, grounding material claims in observed URLs, screenshots, or prior-run comparisons.

It is read-only: it observes and reports only.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add competitor-analysis
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages.

After installing, customize `agent/instructions.md` with competitors, pages to review, your own positioning and market, and reporting preferences. It does not use paid search APIs.

## Usage

Run the agent on demand against competitor URLs, or use the bundled weekly schedule (Mondays at 09:00 UTC). It compares against prior artifacts in `reports/competitor-analysis/history` when available.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation uses `agent-browser` in the Eve sandbox, with no auth by default.

## Limitations

- If browser automation is unavailable or blocked, the agent records the blocker and continues where it can.
- History comparison requires persisted prior-run artifacts; ephemeral environments establish a new baseline.
- Screenshots and reports are session-local unless you persist them.
- It observes only public, configured competitor pages and does not use paid search or market-intelligence APIs.
