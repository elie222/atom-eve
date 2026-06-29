# Stripe Revenue & Churn Pulse

A revenue analyst agent that writes a weekly revenue and churn pulse for your team.

## What it does

Pulls revenue and churn facts from Stripe, cross-references at-risk customers against PostHog product engagement, and posts a grounded pulse to Slack. Every claim traces back to retrieved data; missing facts are reported as missing rather than guessed.

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

## Usage

Mention the agent in Slack to generate a pulse on demand, or use the bundled weekly schedule (Mondays at 09:00 UTC). The final assistant message becomes the Slack post.

## Connections and auth

- **Slack** — a bidirectional channel authenticated via Vercel Connect (`connectSlackCredentials`). The Eve channel is reachable through Vercel OIDC, with a local-dev fallback for `eve dev`.

The Stripe and PostHog CLIs read their credentials from the sandbox environment.

## Limitations

- Numbers come only from the `stripe` and `posthog-cli` CLIs; missing facts are called out.
- MRR is derived from active subscription items, not read from a Stripe MRR endpoint.
- The pulse is machine-generated and should be reviewed before decisions or customer outreach.
