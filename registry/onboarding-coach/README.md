# Onboarding Coach Agent

A PostHog activation agent that finds users stuck before activation and drafts nudges.

## What it does

Reads your activation funnel in [PostHog](https://posthog.com), identifies where users drop off before activation, and drafts a nudge for each high drop-off step. Drafts include the target step and trigger condition for operator approval.

It is read-only and draft-first: it never sends messages, enrolls users in flows, or changes PostHog.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add onboarding-coach
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a PostHog personal API key with read access and note your project ID. Set:

- `POSTHOG_CLI_API_KEY` — PostHog personal API key for the CLI.
- `POSTHOG_CLI_PROJECT_ID` — PostHog project id.

For EU or self-hosted PostHog, pass `--host` to `posthog-cli`, for example `--host https://eu.posthog.com`. `posthog-cli login` is the interactive alternative to env vars.

By default the agent inspects a generic `signed_up -> onboarding_started -> key_feature_used -> activated` funnel. Edit `agent/instructions.md` with your activation events and lookback window.

## Usage

Ask the agent to review the activation funnel on demand, or use the bundled daily schedule (09:00 UTC). Review and send approved nudges yourself, or add your own write tool.

## Connections and auth

This agent has no external channel connection. It queries PostHog through the official `posthog-cli`, using `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment. It never passes `--confirm`, so it cannot run destructive PostHog tools.

## Limitations

- The agent reads funnel data and drafts nudges only; it does not contact users or change flags.
- It relies on `posthog-cli` being installed and authenticated; if unavailable, it reports the blocker.
- Sending nudges and product changes are left to the operator or a write tool you add.
- Review drafted nudges and target conditions before contacting real users.
