# Analytics Digest Agent

A PostHog analytics agent that writes a plain-language weekly digest for operators.

## What it does

Pulls key event trends from your [PostHog](https://posthog.com) project and turns them into a short weekly digest an operator can skim. It leads with the headline movement, calls out events that rose or fell materially week over week, and flags possible tracking regressions, releases, or real usage shifts.

It queries PostHog through the official PostHog CLI (`posthog-cli`) running in the eve sandbox, not a hand-written REST client, following the CLI's discover -> info -> call workflow. It is read-only and draft-first: it never creates or edits dashboards, insights, or any PostHog configuration.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add analytics-digest
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a personal API key in PostHog (Settings -> Personal API keys) with read access, and note your project ID (Settings -> Project). Set these environment variables for the agent's sandbox:

- `POSTHOG_CLI_API_KEY` — PostHog personal API key for the CLI.
- `POSTHOG_CLI_PROJECT_ID` — PostHog project id.

If your project is on the EU cloud or self-hosted, pass `--host` to the CLI (for example `--host https://eu.posthog.com`).

The sandbox bootstraps the `posthog-cli` binary on first run, so the first run may spend extra time while the sandbox template is built.

## Usage

Ask the agent to review recent event trends on demand, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the digest lands in that run's session (inspect it via the eve channel session stream). There is no external channel — the digest is the session output. Wire it to your own Slack, ticket, or storage workflow if you want persisted run history.

## Connections and auth

This agent has no external channel connection. It queries PostHog through the official `posthog-cli` running in the eve sandbox, which reads `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment. The agent never passes `--confirm`, so it cannot run PostHog's destructive tools.

## Limitations

- The agent is read-only and draft-first; it must follow the CLI's `posthog-cli api info <tool>` step before any call and never guesses tool names or schemas.
- It relies on `posthog-cli` being installed and authenticated in the sandbox. If the CLI is unavailable, the agent reports the blocker instead of inventing numbers.
- Outputs are session-local Markdown digests. Save them externally if you want longer run history.
- PostHog person-property values reflect what was set at ingest time, not the person's current value. Always confirm surprising movements against PostHog directly before acting on them.
