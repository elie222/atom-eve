# Analytics Digest Agent

A PostHog analytics agent that writes a plain-language weekly digest for operators.

## What it does

Pulls key event trends from your [PostHog](https://posthog.com) project and turns them into a short digest. It leads with the headline movement, calls out material week-over-week changes, and flags possible tracking regressions, releases, or real usage shifts.

It is read-only and draft-first: it never creates or edits dashboards, insights, or PostHog configuration.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add analytics-digest
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a PostHog personal API key with read access and note your project ID. Set:

- `POSTHOG_CLI_API_KEY` — PostHog personal API key for the CLI.
- `POSTHOG_CLI_PROJECT_ID` — PostHog project id.

For EU cloud or self-hosted PostHog, pass `--host` to the CLI, for example `--host https://eu.posthog.com`.

## Usage

Ask the agent to review recent event trends on demand, or use the bundled weekly schedule (Mondays at 09:00 UTC). Scheduled digests appear in the Eve run session unless you wire them to Slack, tickets, or storage.

## Connections and auth

This agent has no external channel connection. It queries PostHog through the official `posthog-cli`, using `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment. It never passes `--confirm`, so it cannot run destructive PostHog tools.

## Limitations

- The agent is read-only and must inspect CLI tool schemas before calling them.
- It relies on `posthog-cli` being installed and authenticated; if unavailable, it reports the blocker.
- Outputs are session-local Markdown digests unless you save them externally.
- PostHog person-property values reflect ingest-time values. Confirm surprising movements in PostHog before acting.
