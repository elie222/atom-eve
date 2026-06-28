# Spend Tracker Agent

## What it does

Reviews recent [Stripe](https://stripe.com) charges, categorizes spend (software/SaaS, infrastructure, advertising, payment fees, payroll/contractors, uncategorized), and surfaces a prioritized list of flags: likely duplicate charges or double-billed subscriptions, recurring SaaS to confirm is still in use, and amount anomalies well above the typical charge. It is read-only and report-first: it never refunds, cancels, or changes anything, and every flag is presented for an operator to verify and act on. The only custom tool is a small Stripe charges reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add spend-tracker
```

Target overrides:

```bash
npx atom-eve add spend-tracker --target eve
npx atom-eve add spend-tracker --target flue
```

## Setup

Create a Stripe secret API key from your Stripe Dashboard. A restricted key with read access to charges is sufficient and recommended.

Required environment variables:

```bash
STRIPE_SECRET_KEY=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent spend, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (Mondays at 09:00).
- Flue installs an agent plus `src/workflows/spend-tracker-weekly.ts`.

The agent reads recent charges, categorizes them, and returns spend totals plus flags for duplicates, unused SaaS, and anomalies. Verify the flags in Stripe and take any action yourself, or add your own write tool.

## Connections and auth

This package uses a custom Stripe tool with env-token auth because the Stripe charges endpoint is outside the framework-native toolset. The secret key is read by the installed project at runtime via `STRIPE_SECRET_KEY`.

## Limitations

- The reference implementation is read-only. It only reads charges; it does not refund, cancel subscriptions, or change anything in Stripe.
- "Unused SaaS" cannot be confirmed from charge data alone. The agent flags recurring SaaS merchants for you to confirm against actual usage before renewal.
- Categorization is keyword-based and approximate; edit the category rules in `lib/stripe.ts` to fit your vendors.
- Amounts are divided by 100 and not adjusted for zero-decimal currencies. Always verify flagged amounts against the Stripe Dashboard before acting.
