# Stripe Revenue & Churn Pulse

A revenue analyst agent that writes a weekly revenue and churn pulse for your team.

## What it does

Pulls raw revenue and churn facts from Stripe (subscriptions, invoices, charges, cancellation events), cross-references at-risk customers against PostHog product engagement, and posts a grounded, prioritized pulse to Slack. Every claim traces back to a fact it retrieved — it never fabricates numbers.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add stripe-pulse
```

This copies the agent into `agent/` in your eve app.

## Setup

Set the following environment variables for the agent's sandbox:

- `STRIPE_API_KEY` — a restricted, read-only Stripe key.
- `POSTHOG_CLI_API_KEY` — PostHog personal API key for the CLI.
- `POSTHOG_CLI_PROJECT_ID` — PostHog project id.

Optionally set `SLACK_PULSE_CHANNEL_ID` to target the weekly schedule at a specific channel.

The sandbox bootstraps the `stripe` and `posthog-cli` binaries on first run.

## Usage

Mention the agent in Slack to generate a pulse on demand, or let the bundled weekly schedule (Mondays at 09:00 UTC) post it automatically. The final assistant message becomes the Slack post.

## Connections and auth

- **Slack** — a bidirectional channel authenticated via Vercel Connect (`connectSlackCredentials`). The eve channel is reachable through Vercel OIDC, with a local-dev fallback for `eve dev`.

## Limitations

- Numbers come only from the `stripe` and `posthog-cli` CLIs; if a fact is missing it is reported as missing rather than guessed.
- MRR is derived from active subscription items, not read from a Stripe MRR endpoint.
- The pulse is machine-generated and intended for a busy founder: headline, a few facts, and a short prioritized action list.
