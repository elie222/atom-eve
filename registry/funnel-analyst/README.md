# Funnel Analyst Agent

A PostHog funnel agent that finds the biggest conversion drop-offs and recommends where to focus.

## What it does

Builds funnels and retention/cohort views from your [PostHog](https://posthog.com) project, finds the biggest conversion drop-offs, and recommends where the team should focus. It returns a Markdown report with the largest drop-off step, the retention trend, and concrete next steps. It is read-only: it never creates or edits events, insights, dashboards, cohorts, or any PostHog configuration.

It queries PostHog through the official PostHog CLI (`posthog-cli`) running in the eve sandbox, not a hand-written REST client. The CLI's `api` interface exposes PostHog's full tool surface and handles auth, so the agent follows a mandatory discover -> inspect -> confirm -> call workflow and never guesses tool names or schemas.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add funnel-analyst
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a personal API key in PostHog (Settings -> Personal API keys) with read access, and note your project ID (Settings -> Project). Set these environment variables for the agent's sandbox:

- `POSTHOG_CLI_API_KEY` — PostHog personal API key for the CLI.
- `POSTHOG_CLI_PROJECT_ID` — PostHog project id.

If your project is on the EU cloud or self-hosted, pass `--host` to the CLI (for example `--host https://eu.posthog.com`). `posthog-cli login` is the interactive alternative to the env vars.

The sandbox bootstraps the `posthog-cli` binary on first run, so the first run may spend extra time while the sandbox template is built. Give the agent your business context and the real product event names so the funnel matches your product.

## Usage

Ask the agent to review a funnel on demand, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent discovers the right PostHog tools with `posthog-cli api`, confirms the events exist with `read-data-schema`, builds the funnel and retention/cohort views, identifies the biggest drop-off, summarizes the retention curve, and recommends where to focus.

## Connections and auth

This agent has no external channel connection. It queries PostHog through the official `posthog-cli` running in the eve sandbox, which reads `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment. The agent never passes `--confirm`, so it cannot run PostHog's destructive tools.

## Limitations

- The agent is read-only: it queries funnel and retention data and recommends actions, but never creates or edits insights, dashboards, cohorts, or events.
- It relies on `posthog-cli` being installed and authenticated in the sandbox. If the CLI or auth is unavailable, the agent reports the blocker instead of inventing numbers.
- Reports are session-local Markdown. Save them externally if you want longer run history.
- Always confirm the funnel definition and event names match the intended user journey before acting on the recommendations.
