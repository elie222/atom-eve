# Claim Checker Agent

A browser-driven agent that inventories marketing claims and drafts repairs for the riskiest overstatements.

## What it does

Crawls your configured marketing site, inventories every customer-facing claim, checks each against your product sources of truth, and drafts repairs for the riskiest overstatements (unsubstantiated metrics, absolute or superlative language, unsupported compliance/security assertions, competitor comparisons). It is read-only: it lists, verifies, flags, and drafts suggested rewrites only, and never edits, publishes, or ships any marketing copy.

It uses fetch and sandbox commands for lightweight collection and drives a real browser (Agent Browser) in the eve sandbox for screenshots and dynamic pages, following the open -> snapshot -> screenshot loop. The capability is the browser and fetch; the LLM does the verdict and repair drafting.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add claim-checker
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built.

After installing, customize `agent/instructions.md` with your real marketing URLs, product sources of truth (docs, changelog, pricing config), claims policy, and review preferences.

## Usage

Run the agent on demand against your marketing pages, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent crawls the configured pages, records each claim with its exact wording, source URL, type, and a verdict (supported, unverified, or overstated) grounded in your product sources of truth, ranks flagged claims by risk, and drafts a defensible repair for each high-risk claim.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default. For authenticated pages, create a browser session/profile manually outside this package and adapt the instructions.

## Limitations

- Browser automation depends on `agent-browser` being available in the eve sandbox. If it is unavailable, the agent reports the blocker instead of doing a static audit.
- Verdicts are only as good as the product sources of truth you point it at; it marks anything it cannot verify as unverified rather than guessing.
- Screenshots and reports are session-local artifacts; wire them to your own storage if you need long-term history.
- Suggested repairs are drafts for a human to review and apply; the agent never publishes copy.
