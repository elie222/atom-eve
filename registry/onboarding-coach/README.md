# Onboarding Coach Agent

A PostHog activation agent that finds users stuck before activation and drafts a nudge per onboarding step.

## What it does

Finds users who get stuck before activation in [PostHog](https://posthog.com) and drafts the right nudge for each onboarding step. It reads the activation funnel, identifies where users drop off before activation, and comes back with a nudge draft per high drop-off step for operator approval. It is draft-first and read-only: it never sends messages, enrolls users in flows, or changes anything in PostHog.

It queries PostHog through the official PostHog CLI (`posthog-cli`) running in the eve sandbox, not a hand-written REST client. The CLI's `api` interface exposes PostHog's full tool surface and handles auth, so the agent follows a robust discover -> info -> call workflow rather than guessing endpoints.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add onboarding-coach
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a personal API key in PostHog (Settings -> Personal API keys) with read access, and note your project ID (Settings -> Project). Set these environment variables for the agent's sandbox:

- `POSTHOG_CLI_API_KEY` — PostHog personal API key for the CLI.
- `POSTHOG_CLI_PROJECT_ID` — PostHog project id.

For EU or self-hosted PostHog, pass `--host` to `posthog-cli` (for example `--host https://eu.posthog.com`). `posthog-cli login` is the interactive alternative to the env vars.

By default the agent inspects a generic `signed_up -> onboarding_started -> key_feature_used -> activated` funnel. Edit `agent/instructions.md` with your ordered activation events and lookback window so the funnel matches your product. The sandbox bootstraps the `posthog-cli` binary on first run, so the first run may spend extra time while the sandbox template is built.

## Usage

Ask the agent to review the activation funnel on demand, or let the bundled daily schedule (09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent uses `posthog-cli api` following the mandatory discover -> info -> call workflow, confirms events exist with `read-data-schema`, then drafts a nudge per high drop-off step with its target step and trigger condition. Review and send approved nudges yourself, or add your own write tool.

## Connections and auth

This agent has no external channel connection. It queries PostHog through the official `posthog-cli` running in the eve sandbox, which reads `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment. The agent never passes `--confirm`, so it cannot run PostHog's destructive tools.

## Limitations

- The agent is read-only by design: it reads funnel data and drafts nudges. It does not send messages, enroll users in flows, or change feature flags.
- It relies on `posthog-cli` being installed and authenticated in the sandbox. If the CLI or auth is unavailable, the agent reports the blocker instead of inventing funnel numbers.
- Sending nudges and any product or messaging changes are intentionally left to the operator or a write tool you add yourself.
- Always review drafted nudges and their target conditions before contacting real users.
