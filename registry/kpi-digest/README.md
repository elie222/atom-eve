# KPI Digest Agent

## What it does

Assembles revenue KPIs from [Stripe](https://stripe.com) and product KPIs from [PostHog](https://posthog.com) into one weekly digest. A custom Stripe tool reads revenue (MRR, active/new/churned subscriptions, collected revenue, and top accounts), while PostHog product KPIs (event volume and top event trends versus the prior window) are read through the official PostHog CLI (`posthog-cli`) running in the framework sandbox. The agent then turns the numbers into a short plain-language summary.

It is read-only and draft-first: it only reads data, the digest comes back for operator review, and the agent never changes subscriptions, tracking, dashboards, or any Stripe or PostHog configuration.

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

Revenue uses a custom Stripe REST tool; product KPIs use the official PostHog CLI running in the framework sandbox. For Eve, the installed sandbox bootstrap (`agent/sandbox/`) runs `setup-posthog-cli.sh`, which installs `@posthog/cli` the first time the sandbox starts. The first run may spend extra time while the sandbox template is built. For Flue or another isolated sandbox, install `@posthog/cli` as part of that sandbox's setup/lifecycle so `posthog-cli` is on PATH.

Create a Stripe secret key with read access to subscriptions and invoices. For PostHog, create a personal API key (Settings → Personal API keys) with read access and note your numeric project ID (Settings → Project).

Required environment variables:

```bash
STRIPE_SECRET_KEY=...
POSTHOG_CLI_API_KEY=phx_...
POSTHOG_CLI_PROJECT_ID=12345
```

If your PostHog project is on the EU cloud or self-hosted, pass `--host` to the CLI (for example `--host https://eu.posthog.com`). As an interactive alternative to the PostHog env vars, you can authenticate the CLI once with:

```bash
posthog-cli login
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to assemble this week's digest, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (cron `0 9 * * 1`, Mondays at 09:00 UTC).
- Flue installs an agent plus `src/workflows/kpi-digest-weekly.ts`.

The agent calls the Stripe tool to read revenue, then runs `posthog-cli api` in the sandbox following the discover → info → call workflow (search for the tool, read its schema with `posthog-cli api info`, confirm events with `read-data-schema`, then call it). It writes a combined digest that leads with the headline revenue movement and pairs it with the matching product-usage signal. Expansion and contraction MRR need a prior snapshot, so save each digest alongside past runs if you want week-over-week trend notes.

## Connections and auth

This package combines two data sources:

- **Stripe** is read through a custom REST tool with env-token auth (`STRIPE_SECRET_KEY`), because the Stripe endpoint sits outside the framework-native toolset.
- **PostHog** is read through the official `posthog-cli` running in the framework sandbox, declared as a `posthog-cli` custom-tool connection with env auth. The CLI reads `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment (or you can run `posthog-cli login` once). The agent never passes `--confirm`, so it cannot run PostHog's destructive tools.

Nothing is written back to either platform.

## Limitations

- The agent is read-only and draft-first: it summarizes subscriptions, invoices, and event counts but does not create, update, or cancel anything in Stripe or PostHog. For PostHog it must follow the CLI's `posthog-cli api info <tool>` step before any call and never guesses tool names or schemas.
- It relies on `posthog-cli` being installed and authenticated in the runtime environment or Eve sandbox. If the Stripe tool or the CLI is unavailable, the agent reports the blocker instead of inventing numbers.
- MRR is summed across currencies without conversion, so mixed-currency accounts are flagged and should be segmented before reporting.
- Expansion and contraction MRR are not computed in a single run; they require comparing against a saved prior snapshot.
- PostHog person-property values reflect what was set at ingest time, not the person's current value. Always review the digest before sharing it as an official metric.
