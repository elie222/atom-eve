# Stripe Revenue & Churn Pulse

## What it does

Gives you a weekly read on where revenue and churn are heading, posted to Slack. Each week it:

- pulls revenue and churn facts from Stripe (subscriptions, invoices, charges, cancellations)
- cross-references at-risk customers against their PostHog product engagement
- writes a grounded pulse: the headline, a few cited facts, and a prioritized action list
- posts the pulse to the Slack channel

Every number traces back to retrieved data; anything it cannot find is flagged as missing, not guessed. It only posts the pulse, and never changes anything in Stripe or PostHog.

## Setup

- A restricted, read-only Stripe key.
- Your PostHog CLI credentials for reading product engagement.
- Connect Slack in Vercel so it can post; it authenticates through Vercel Connect and never sees a token.

Set the lookback window and pulse format in `agent/instructions.md`.
