# Refund Chaser Agent

## What it does

Tracks open [Stripe](https://stripe.com) refunds and disputes and drafts the next follow-up for each one until it is resolved. It is read-only and draft-first: the agent reads the current open refunds and disputes, then returns operator-ready follow-up drafts (a status update for pending refunds, an evidence-gathering plan for disputes that need a response). It never issues refunds or submits dispute evidence on its own.

The only custom tool is a small Stripe API reader that lists refunds and disputes and flags which ones are still open.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add refund-chaser
```

Target overrides:

```bash
npx atom-eve add refund-chaser --target eve
npx atom-eve add refund-chaser --target flue
```

## Setup

Create a Stripe secret key (or a restricted key with read access to refunds and disputes) from your Stripe dashboard.

Required environment variables:

```bash
STRIPE_SECRET_KEY=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review open refunds and disputes and draft follow-ups, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (runs at `0 9 * * *`).
- Flue installs an agent plus `src/workflows/refund-chaser-daily.ts`.

The agent reads your open refunds and disputes, then drafts the next follow-up for each. Review the drafts, then issue refunds or submit dispute evidence yourself in Stripe, or add your own write tool.

## Connections and auth

This package uses a custom Stripe tool with env-token auth because the refund and dispute list endpoints are outside the framework-native toolset. The secret key is read by the installed project at runtime via `STRIPE_SECRET_KEY`.

## Limitations

- The reference implementation is read-only: it lists refunds and disputes and drafts follow-ups, but does not issue refunds, submit dispute evidence, or send any message.
- It chases the most recent open refunds and disputes (up to the Stripe page size); it does not paginate through the full history.
- Always review drafted follow-ups and the underlying Stripe records before acting on real customers.
