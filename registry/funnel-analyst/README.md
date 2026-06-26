# Funnel Analyst Agent

## What it does

Builds funnels and retention/cohort views from your [PostHog](https://posthog.com) project, finds the biggest conversion drop-offs, and recommends where the team should focus. It is read-only: it queries PostHog for funnel and retention data, then returns a summary with the largest drop-off step, the retention trend, and concrete next steps. It does not change events, insights, dashboards, cohorts, or any PostHog configuration.

The only custom tool is a small PostHog query reader (`review_funnels`) that runs a `FunnelsQuery` and a `RetentionQuery` against your project and normalizes the results into step conversion rates, drop-offs, and a retention curve.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add funnel-analyst
```

Target overrides:

```bash
npx atom-eve add funnel-analyst --target eve
npx atom-eve add funnel-analyst --target flue
```

## Setup

Create a PostHog personal API key with read access to your project's insights, and note your numeric project ID (from the PostHog project settings or the URL `/project/<id>`).

Required environment variables:

```bash
POSTHOG_API_KEY=...
POSTHOG_PROJECT_ID=...
```

Optional: set `POSTHOG_HOST` if you are on a non-default region or self-hosted instance (defaults to `https://us.posthog.com`).

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review a funnel, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (cron `0 9 * * 1`).
- Flue installs an agent plus `src/workflows/funnel-analyst-weekly.ts`.

Pass the real product event names as the funnel `steps` (and optionally `dateFrom`, `retentionEvent`, `retentionPeriod`). The agent reads the funnel and retention data, identifies the biggest drop-off, summarizes the retention curve, and recommends where to focus. Act on the recommendations in PostHog yourself, or add your own write tool.

## Connections and auth

This package uses a custom PostHog tool with env-token auth because the PostHog query endpoint is outside the framework-native toolset. The API key and project ID are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only: it queries funnel and retention data and recommends actions, but never creates or edits insights, dashboards, cohorts, or events.
- It runs a single funnel and a single retention view per call; multi-funnel comparisons and breakdowns are left to the operator or a tool you add yourself.
- Retention is summarized from the first cohort returned as a representative curve; review the full cohort matrix in PostHog before drawing strong conclusions.
- Always confirm the funnel definition and event names match the intended user journey before acting on the recommendations.
