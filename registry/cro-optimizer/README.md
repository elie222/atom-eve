# CRO Optimizer Agent

A browser-driven CRO agent that audits landing pages and proposes ranked A/B test ideas.

## What it does

Audits your configured landing pages against conversion heuristics (above-the-fold clarity, value proposition, CTA prominence, friction, trust signals, visual hierarchy, page weight, mobile behavior) and proposes ranked A/B test ideas, each with a falsifiable hypothesis, expected impact, effort, and the primary metric to watch. It is read-only: it produces a plan for an operator to run and never claims any test was shipped, edited, or launched.

It drives a real browser (Agent Browser) in the eve sandbox via the built-in `bash` tool to inspect each page and capture screenshots, and uses the `marketing-psychology` skill to ground why a change should move behavior. The capability is the browser; the LLM does the CRO judgment.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add cro-optimizer
```

This copies the agent into `agent/` in your eve app, and pulls the `marketing-psychology` skill from skills.sh at install time.

## Setup

No credentials or environment variables are required for public pages. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built.

After installing, customize `agent/instructions.md` with your real funnel, audience, offer, and conversion goals. The `marketing-psychology` skill is installed from skills.sh; if remote skill installation is skipped in your environment, install it manually with `npx skills add coreyhaines31/marketingskills@marketing-psychology`.

## Usage

Run the agent on demand against your landing pages, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent inspects each page, captures screenshots, applies the conversion heuristics and marketing-psychology skill, and returns ranked A/B test ideas with hypotheses, expected impact, effort, and measurement notes.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default. It depends on the remote `marketing-psychology` skill, which is resolved from skills.sh at install time rather than vendored in this package.

## Limitations

- Browser automation depends on `agent-browser` being available in the eve sandbox. If it is unavailable, the agent reports the blocker instead of substituting a static HTML or SEO audit.
- The agent produces a test plan only; it never ships, edits, or launches a test.
- Screenshots and reports are session-local artifacts; wire them to your own storage if you need long-term history.
- Expected impact and effort are estimates to prioritize a backlog, not guarantees; validate with real experiments.
