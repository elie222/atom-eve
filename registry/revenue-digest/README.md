# Revenue Digest Agent

## What it does

Reads this project's [Stripe](https://stripe.com) subscriptions and invoices and summarizes MRR, new and churned subscriptions, collected revenue, and the top accounts by MRR into a weekly digest. It is read-only: every run only reads Stripe and returns observations and conservative recommendations, never creating, updating, or canceling anything.

The only custom tool is a small Stripe API reader. MRR is normalized from each subscription's recurring [Prices](https://docs.stripe.com/api/prices) (the deprecated `plan` object is not used). Expansion and contraction MRR need a prior snapshot, so the digest reports new and churned MRR and points you at comparing against last week's saved run.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add revenue-digest
```

Target overrides:

```bash
npx atom-eve add revenue-digest --target eve
npx atom-eve add revenue-digest --target flue
```

## Setup

Create a Stripe API key for the agent. Because this agent only reads data, create a [restricted API key](https://docs.stripe.com/keys/restricted-api-keys) (prefix `rk_`) with read-only access to Subscriptions, Invoices, and Customers rather than a full secret key. Follow the principle of least privilege and rotate the key when access changes.

Required environment variables:

```bash
STRIPE_SECRET_KEY=rk_...
```

Store the key in your secrets manager (or platform environment variables); never commit it to source. Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to read current Stripe revenue and write the digest, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (runs `0 9 * * 1`).
- Flue installs an agent plus `src/workflows/revenue-digest-weekly.ts`.

The agent reads active subscriptions for MRR and top accounts, recently canceled subscriptions for churn, and recently paid invoices for collected revenue, then returns the digest plus read-only recommendations.

For lightweight run history, save each weekly digest somewhere your operator can review, such as `runs/revenue-digest/YYYY-MM-DD.json`. If you include the prior snapshot in the next prompt or workflow context, the agent can report expansion and contraction MRR without needing a database.

Local smoke test with a mocked Stripe response:

```bash
STRIPE_SECRET_KEY=rk_test pnpm dlx tsx -e '
import { reviewRevenue } from "./agent/lib/stripe.ts";
const responses = [
  { data: [{ id: "sub_1", customer: "cus_1", status: "active", created: Math.floor(Date.now() / 1000), canceled_at: null, currency: "usd", items: { data: [{ quantity: 1, price: { unit_amount: 5000, currency: "usd", recurring: { interval: "month", interval_count: 1 } } }] } }] },
  { data: [] },
  { data: [{ amount_paid: 5000 }] }
];
const fetchMock = async () => new Response(JSON.stringify(responses.shift()));
void (async () => {
  console.log(JSON.stringify(await reviewRevenue({}, fetchMock as typeof fetch), null, 2));
})();
'
```

Run the smoke test from an installed Eve app folder after `npx atom-eve add revenue-digest --target eve`. For Flue, change the import path to `./src/lib/agents/revenue-digest/stripe.ts`.

## Connections and auth

This package uses a custom Stripe tool with env-token auth because the subscription and invoice list endpoints are outside the framework-native toolset. The key is read by the installed project at runtime from `STRIPE_SECRET_KEY` and is sent only to `api.stripe.com`.

## Limitations

- The reference implementation is read-only and only calls the subscriptions and invoices list endpoints. It does not create, update, or cancel anything.
- It reads a single page (up to 100) of active and canceled subscriptions and paid invoices. Add pagination if you have more than that in a window.
- Expansion and contraction MRR are not computed from a single read; save weekly digests and compare snapshots to get them.
- MRR is summed across currencies without conversion. If you have mixed-currency subscriptions, segment by currency before reporting. Amounts assume two-decimal currencies; adjust for zero-decimal currencies.
- Always treat the recommendations as observations and review them before acting on real revenue.
