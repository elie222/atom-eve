# KPI Digest Agent

## What it does

Assembles revenue KPIs from [Stripe](https://stripe.com) and product KPIs from [PostHog](https://posthog.com) into one weekly digest. The custom `review_kpis` tool reads Stripe (MRR, active/new/churned subscriptions, collected revenue, and top accounts) and PostHog (event volume and top event trends versus the prior window) in a single pass, then the agent turns the numbers into a short plain-language summary.

It is read-only: the tool only reads data, the digest comes back for operator review, and the agent never changes subscriptions, tracking, dashboards, or any Stripe or PostHog configuration.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add kpi-digest
```

Target overrides:

```bash
npx atom-eve add kpi-digest --target eve
npx atom-eve add kpi-digest --target flue
```

## Setup

Create a Stripe secret key with read access to subscriptions and invoices, and a PostHog personal API key with project query access plus the numeric project id.

Required environment variables:

```bash
STRIPE_SECRET_KEY=...
POSTHOG_API_KEY=...
POSTHOG_PROJECT_ID=...
```

Optionally set `POSTHOG_HOST` if you self-host PostHog or use the EU cloud (defaults to `https://us.posthog.com`). Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to assemble this week's digest, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (cron `0 9 * * 1`, Mondays at 09:00 UTC).
- Flue installs an agent plus `src/workflows/kpi-digest-weekly.ts`.

The agent calls `review_kpis` to read both platforms, then writes a combined digest that leads with the headline revenue movement and pairs it with the matching product-usage signal. Expansion and contraction MRR need a prior snapshot, so save each digest alongside past runs if you want week-over-week trend notes.

## Connections and auth

This package uses two custom tools with env-token auth (one for Stripe, one for PostHog) because both endpoints sit outside the framework-native toolset. The Stripe secret key and PostHog API key plus project id are read by the installed project at runtime; nothing is written back to either platform.

## Limitations

- The reference implementation is read-only: it summarizes subscriptions, invoices, and event counts but does not create, update, or cancel anything in Stripe or PostHog.
- MRR is summed across currencies without conversion, so mixed-currency accounts are flagged and should be segmented before reporting.
- Expansion and contraction MRR are not computed in a single run; they require comparing against a saved prior snapshot.
- Always review the digest before sharing it as an official metric.
