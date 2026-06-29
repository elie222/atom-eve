# CRO Optimizer Agent

A browser-driven CRO agent that audits landing pages and proposes ranked A/B test ideas.

## What it does

Audits configured landing pages for conversion blockers: above-the-fold clarity, value proposition, CTA prominence, friction, trust signals, visual hierarchy, page weight, and mobile behavior. It returns ranked A/B test ideas with hypotheses, expected impact, effort, primary metric, and measurement notes.

It is read-only: it produces a test plan for an operator and never edits, ships, or launches tests.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add cro-optimizer
```

This copies the agent into `agent/` in your eve app and pulls the `marketing-psychology` skill from skills.sh at install time.

## Setup

No credentials or environment variables are required for public pages.

After installing, customize `agent/instructions.md` with your funnel, audience, offer, and conversion goals. If remote skill installation is skipped, install the skill manually:

```bash
npx skills add coreyhaines31/marketingskills@marketing-psychology
```

## Usage

Run the agent on demand against landing pages, or use the bundled weekly schedule (Mondays at 09:00 UTC). It inspects each page, captures screenshots, applies conversion heuristics and the marketing-psychology skill, then returns a prioritized experiment backlog.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation uses `agent-browser` in the Eve sandbox. The `marketing-psychology` skill is resolved from skills.sh at install time rather than vendored in this package.

## Limitations

- Browser automation depends on `agent-browser`; if unavailable, the agent reports the blocker instead of substituting a static audit.
- The agent produces a test plan only; it never ships, edits, or launches a test.
- Screenshots and reports are session-local unless you persist them.
- Expected impact and effort are prioritization estimates, not guarantees.
