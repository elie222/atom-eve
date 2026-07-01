# Dunning

## What it does

Recovers failed payments before the revenue is lost, with a ready-to-send reminder for each account.

Each run it:
- reads recent failed payments, past-due subscriptions, and open invoices in Stripe
- pulls retry status, payment history, and invoice amounts for the accounts that matter
- works out the likely failure cause and the right next step per account
- returns a recovery queue ordered by revenue at risk, plus draft reminder copy grouped by stage

It groups records by customer so no account gets conflicting recommendations, and drafts copy only when the facts make it specific.

## Setup

Create a restricted Stripe key with read access to customers, subscriptions, invoices, payment intents, charges, and events.

Set your retry policy, grace periods, customer segments, and escalation tone in `agent/instructions.md`.
