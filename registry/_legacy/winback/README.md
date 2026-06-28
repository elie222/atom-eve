# Winback Agent

## What it does

Reviews recent cancellations and at-risk subscriptions in your [Stripe](https://stripe.com) account, segments them by cancellation reason, and drafts win-back offers for operator approval. It is draft-first: every offer comes back as a draft with its target segment, the cancellation reason it addresses, and a proposed incentive, and the agent never emails customers or changes a subscription on its own.

The only custom tool is a small Stripe subscriptions reader. It pulls subscriptions, classifies them as recently cancelled or at-risk (past due, unpaid, or set to cancel at period end), groups them by reason, and attaches a draft offer per segment.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add winback
```

Target overrides:

```bash
npx atom-eve add winback --target eve
npx atom-eve add winback --target flue
```

## Setup

Create a Stripe secret key from your Stripe Dashboard (Developers → API keys) with read access to subscriptions. A restricted key with read-only subscription permission is recommended.

Required environment variables:

```bash
STRIPE_SECRET_KEY=sk_live_...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review churn and draft this week's win-back offers, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (cron `0 9 * * 1`).
- Flue installs an agent plus `src/workflows/winback-weekly.ts`.

The agent reads your Stripe subscriptions, segments cancellations and at-risk accounts by reason, then drafts a win-back offer per segment. Review approved drafts and send the outreach or apply any incentive yourself, or add your own write tool.

## Connections and auth

This package uses a custom Stripe tool with env-token auth because the Stripe subscriptions endpoint is outside the framework-native toolset. The secret key is read by the installed project at runtime via `STRIPE_SECRET_KEY` and sent as a Bearer token.

## Limitations

- The reference implementation is read-only: it lists subscriptions and drafts offers, but does not email customers, apply coupons or discounts, or change any subscription.
- Cancellation reasons depend on what Stripe captured in `cancellation_details`; subscriptions without a recorded reason are grouped as `unknown`.
- The default scan covers up to 100 subscriptions and cancellations from the last 30 days. Tune the `limit` and `lookbackDays` tool inputs for larger accounts.
- Always review drafted offers and the target segment before sending to real customers.
