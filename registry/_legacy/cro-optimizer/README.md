# CRO Optimizer Agent

## What it does

The CRO Optimizer Agent audits your landing pages like a conversion rate optimization specialist and proposes ranked A/B test ideas with explicit hypotheses. It is built for growth and marketing teams that want a repeatable, weekly read on where a page is leaking conversions and what to test next.

It opens each configured page with native browser automation, applies conversion heuristics, and reports on:

- Above-the-fold clarity and value proposition
- Headline and message hierarchy
- Primary CTA prominence, placement, and copy
- Friction in the conversion path (forms, distractions, competing CTAs)
- Trust and social proof
- Visual hierarchy, readability, and perceived performance
- Mobile and responsive behavior where observable

The agent then returns ranked A/B test ideas, each with a falsifiable hypothesis, an expected-impact and effort estimate, and the metric to watch. Conversion psychology comes from a shared remote skill rather than copy-pasted prompt text: this agent declares the Corey Haines `marketing-psychology` skill, which the installer pulls from skills.sh at install time.

This agent is read-only and draft-first. It plans tests and never claims to have shipped, edited, or launched anything. It uses the target framework's native browser and sandbox command capabilities; it does not install a custom browser wrapper tool and does not rely on paid analytics or search APIs.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add cro-optimizer --target flue
```

or:

```bash
npx atom-eve add cro-optimizer --target eve
```

## Setup

Configure the landing page URLs in the prompt you send to the agent, or keep them in your app's local env/config notes and reference those notes from the prompt. For example:

```text
Run the weekly CRO audit for:
- Home: https://acme.example/
- Pricing: https://acme.example/pricing
```

No API keys are required for public pages.

The installer also pulls the shared `coreyhaines31/marketingskills@marketing-psychology` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@marketing-psychology
```

For Eve, no custom tool dependency is required. The installed sandbox bootstrap runs `setup-agent-browser.sh` to prepare Agent Browser inside the Eve sandbox and create:

```text
reports/cro-optimizer/history
reports/cro-optimizer/artifacts
```

The first browser run may spend extra time while the sandbox template is built.

For Flue Node.js with a local sandbox, install Agent Browser where the sandbox can run commands:

```bash
pnpm add agent-browser
agent-browser install
```

For Cloudflare or another isolated Flue sandbox, install Agent Browser as part of that sandbox's setup/lifecycle rather than through an application tool. If Agent Browser is unavailable, the agent should report that the audit is blocked rather than silently switching to a static HTML audit.

## Usage

Run the weekly schedule or ask the agent directly:

```text
Run the weekly CRO audit.

Pages:
- Home: https://acme.example/
- Pricing: https://acme.example/pricing

Open each page with Agent Browser, capture screenshots, apply conversion heuristics, compare against reports/cro-optimizer/history if any prior runs exist, and return ranked A/B test ideas with hypotheses.
```

The agent should use native capabilities available in the host framework:

```bash
npx agent-browser --session cro-optimizer open https://acme.example/
npx agent-browser --session cro-optimizer snapshot -i
npx agent-browser --session cro-optimizer screenshot reports/cro-optimizer/artifacts/home.png
```

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts`.
- Flue installs an agent plus `src/workflows/cro-optimizer-weekly.ts`.

Return a concise Markdown report with:

1. Executive summary
2. Pages reviewed
3. Conversion heuristic findings
4. Ranked A/B test ideas with hypotheses
5. Screenshots and artifacts
6. Notable deltas from prior runs
7. Recommended next steps and follow-up questions

## Connections and auth

This package uses browser automation through the `agent-browser` CLI in the framework sandbox. There is no auth by default and there are no required environment variables.

For authenticated pages, create a browser session/profile manually and adapt the installed instructions to pass the relevant Agent Browser flags. Do not commit session state or credentials.

## Limitations

- The agent is read-only: it plans A/B tests and never ships, edits, or launches them.
- Browser automation depends on `agent-browser` being available in the runtime environment or Eve sandbox.
- The MVP only compares against files available in `reports/cro-optimizer/history/...`; local history can be lost when sandboxes are ephemeral. DB-backed history, object storage for screenshots, and Slack or email delivery are future work.
- The agent does not have live analytics or experiment data; impact estimates are heuristic, not measured. Validate every test in your own experimentation platform.
