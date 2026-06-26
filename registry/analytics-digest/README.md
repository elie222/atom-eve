# Analytics Digest Agent

## What it does

Pulls key event trends from your [PostHog](https://posthog.com) project and writes a plain-language weekly digest an operator can skim. It compares the last week of event volume against the prior week, highlights events that rose or fell materially, and flags possible tracking regressions.

The agent uses framework-native agent, schedule, and workflow files. The only custom tool is a small PostHog query-API reader. It is read-only: it never creates or edits dashboards, insights, or any PostHog configuration.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add analytics-digest
```

Target overrides:

```bash
npx atom-eve add analytics-digest --target eve
npx atom-eve add analytics-digest --target flue
```

## Setup

Create a personal API key in PostHog (Settings → Personal API keys) with query read access, and note your project ID (Settings → Project).

Required environment variables:

```bash
POSTHOG_API_KEY=phx_...
POSTHOG_PROJECT_ID=12345
```

If your project is on the EU cloud or self-hosted, set `POSTHOG_HOST` (defaults to `https://us.posthog.com`):

```bash
POSTHOG_HOST=https://eu.posthog.com
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent event trends, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts`.
- Flue installs an agent plus `src/workflows/analytics-digest-weekly.ts`.

The agent queries event counts for the last week and the prior week, computes per-event change and share of total, then writes a plain-language digest. Optional tool inputs let you set the `asOf` end date, the comparison `windowDays`, and the event `limit`.

For lightweight run history, save the weekly digest somewhere your operator can review, such as `runs/analytics-digest/YYYY-MM-DD.md` or a team ticket/comment.

## Connections and auth

This package uses a custom PostHog tool with env-token auth because the PostHog query/insights API is outside the framework-native toolset. The personal API key and project ID are read by the installed project at runtime via a Bearer header.

## Limitations

- The reference implementation is read-only and only calls the query API for event counts; it does not read funnels, retention, or session data.
- It compares the last window with the immediately preceding window. Save weekly outputs externally if you want longer run history.
- HogQL person-property values reflect what was set at ingest time, not the person's current value.
- Always confirm surprising movements against PostHog directly before acting on them.
