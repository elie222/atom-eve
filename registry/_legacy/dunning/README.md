# Dunning Agent

## What it does

Reviews your recent Stripe charges to find failed payments and cards that are about to expire, then drafts a staged recovery email sequence for an operator to review and send.

The agent uses framework-native agent, schedule, and workflow files. The only custom tool is the small Stripe reader needed to list recent charges. It is draft-first and read-only: it never charges cards, retries payments, or sends email.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add dunning
```

Target overrides:

```bash
npx atom-eve add dunning --target eve
npx atom-eve add dunning --target flue
```

## Setup

Create a Stripe restricted API key with read access to charges. Do not grant write scopes unless you intentionally add your own retry or email tools later.

Required environment variables:

```bash
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... / rk_live_...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review failed payments, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (cron `0 9 * * *`).
- Flue installs an agent plus `src/workflows/dunning-daily.ts`.

The agent scans recent charges, separates failed payments from cards expiring this or next month, builds a staged recovery email sequence (immediate, day 3, and day 7 reminders, plus an expiring-card notice), and returns recommendations. Each email is a draft with placeholders such as `{{customer_name}}` and `{{update_payment_link}}` that you fill in before sending.

Local smoke test with a mocked Stripe response:

```bash
STRIPE_SECRET_KEY=sk_test_123 pnpm dlx tsx -e '
import { reviewFailedPayments } from "./agent/lib/stripe.ts";
const charge = {
  data: [
    { id: "ch_1", amount: 4900, currency: "usd", status: "failed", created: 1750000000, failure_code: "card_declined", failure_message: "Your card was declined.", billing_details: { email: "a@example.com", name: "Avery" }, payment_method_details: { card: { brand: "visa", last4: "4242", exp_month: 12, exp_year: 2027 } } }
  ]
};
const fetchMock = async () => new Response(JSON.stringify(charge));
void (async () => {
  const review = await reviewFailedPayments({ currentDate: "2026-06-26" }, fetchMock as typeof fetch);
  console.log(JSON.stringify(review, null, 2));
})();
'
```

Run the smoke test from an installed Eve app folder after `npx atom-eve add dunning --target eve`. For Flue, change the import path to `./src/lib/agents/dunning/stripe.ts`.

For lightweight run history, save the daily response somewhere your operator can review, such as `runs/dunning/YYYY-MM-DD.md` or a billing ticket. If you include prior summaries in the next prompt or workflow context, the agent can avoid re-drafting for customers who already recovered.

## Connections and auth

This package uses a custom Stripe tool with env-key auth because listing charges is outside the framework-native toolset. The secret key is read by the installed project at runtime via `STRIPE_SECRET_KEY`. Prefer a restricted key scoped to read-only charge access.

## Limitations

- The reference implementation is read-only and only calls the Stripe charges list endpoint.
- It detects expiring cards from the card metadata attached to recent charges, so customers with no recent charge will not appear.
- Recovery emails are drafts with placeholders; personalize the customer name and update-payment link before sending.
- It scans the most recent charges only (up to 100). Save daily outputs externally if you want longer run history.
- Always review drafts before sending, and never let this agent charge cards or send mail on its own.
