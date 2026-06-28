# Invoice Chaser Agent

## What it does

Reviews your project's open [Stripe](https://stripe.com) invoices, finds the ones that are overdue, and drafts escalating payment reminders plus an aging summary for an operator to approve. It is draft-first and read-only: it groups overdue invoices into 1-30 / 31-60 / 61-90 / 90+ day buckets, drafts a reminder whose tone escalates with how late the invoice is, and never sends a reminder or changes an invoice on its own.

The agent uses framework-native agent, schedule, and workflow files. The only custom tool is a small Stripe API reader that lists open invoices.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add invoice-chaser
```

Target overrides:

```bash
npx atom-eve add invoice-chaser --target eve
npx atom-eve add invoice-chaser --target flue
```

## Setup

Create a Stripe secret key (or a restricted key with read access to Invoices) from your Stripe dashboard. Do not grant write scopes unless you intentionally add your own send/void tools later.

Required environment variables:

```bash
STRIPE_SECRET_KEY=sk_live_...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review overdue invoices and draft reminders, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (runs at 09:00 UTC).
- Flue installs an agent plus `src/workflows/invoice-chaser-daily.ts`.

The agent reads your open invoices, keeps the ones whose due date is in the past, calculates days overdue and aging buckets, and returns an aging summary alongside an escalating reminder draft for each overdue invoice. Review and send approved reminders from Stripe yourself, or add your own write tool.

Local smoke test with a mocked Stripe response:

```bash
STRIPE_SECRET_KEY=sk_test pnpm dlx tsx -e '
import { reviewOverdueInvoices } from "./agent/lib/stripe.ts";
const due = Math.floor(Date.now() / 1000) - 45 * 86400;
const payload = { data: [{ id: "in_1", number: "INV-001", customer_name: "Acme", customer_email: "ap@acme.test", amount_due: 25000, currency: "usd", due_date: due, hosted_invoice_url: "https://pay.stripe.com/x" }] };
const fetchMock = async () => new Response(JSON.stringify(payload));
void (async () => {
  console.log(JSON.stringify(await reviewOverdueInvoices({}, fetchMock as typeof fetch), null, 2));
})();
'
```

Run the smoke test from an installed Eve app folder after `npx atom-eve add invoice-chaser --target eve`. For Flue, change the import path to `./src/lib/agents/invoice-chaser/stripe.ts`.

## Connections and auth

This package uses a custom Stripe tool with env-key auth because the Stripe invoice list endpoint is outside the framework-native toolset. The secret key is read by the installed project at runtime.

## Limitations

- The reference implementation is read-only and only calls the open-invoices list endpoint (first page, up to 100 invoices); it does not paginate, send reminders, or modify invoices.
- It treats any open invoice with a past due date as overdue and skips invoices that have no due date set.
- Amounts are reported in each invoice's smallest currency unit and grouped per currency; review mixed-currency totals before acting.
- The escalation tiers and aging buckets are intentionally simple heuristics; adapt them to your collections policy.
- Always review the drafted reminders and aging summary before contacting real customers.
