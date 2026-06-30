# Dunning

## What it does

Reviews failed payments, past-due subscriptions, open invoices, retry status, customer payment history, and invoice amounts in Stripe. It returns a Markdown recovery queue with priority, account context, likely cause, recommended next step, and approved-ready reminder copy for a human to send.

## Setup

Create a restricted Stripe key with read access to customers, subscriptions, invoices, payment intents, charges, and events. Configure your retry policy, grace periods, customer segments, and escalation tone in `agent/instructions.md` or the scheduled prompt.
