# Funnel Analyst Agent

A PostHog funnel agent that finds the biggest conversion drop-offs and recommends where to focus.

## What it does

Builds funnel and retention/cohort views from your [PostHog](https://posthog.com) project, finds the largest conversion drop-offs, and recommends where the team should focus. Reports include the largest drop-off step, retention trend, and concrete next steps.

It is read-only: it never creates or edits events, insights, dashboards, cohorts, or PostHog configuration.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add funnel-analyst
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a PostHog personal API key with read access and note your project ID. Set:

- `POSTHOG_CLI_API_KEY` — PostHog personal API key for the CLI.
- `POSTHOG_CLI_PROJECT_ID` — PostHog project id.

For EU cloud or self-hosted PostHog, pass `--host` to the CLI, for example `--host https://eu.posthog.com`. `posthog-cli login` is the interactive alternative to env vars.

Give the agent your business context and real product event names so the funnel matches your product.

## Usage

Ask the agent to review a funnel on demand, or use the bundled weekly schedule (Mondays at 09:00 UTC). It confirms events, builds the funnel and retention/cohort views, identifies the biggest drop-off, summarizes retention, and recommends where to focus.

## Connections and auth

This agent has no external channel connection. It queries PostHog through the official `posthog-cli`, using `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment. It never passes `--confirm`, so it cannot run destructive PostHog tools.

## Limitations

- The agent is read-only and never creates or edits insights, dashboards, cohorts, or events.
- It relies on `posthog-cli` being installed and authenticated; if unavailable, it reports the blocker.
- Reports are session-local Markdown unless you save them externally.
- Confirm funnel definitions and event names before acting on recommendations.
