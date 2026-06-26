# Onboarding Coach Agent

## What it does

Reads the project's [PostHog](https://posthog.com) activation funnel to find users who get stuck before activation, then drafts the right nudge for each onboarding step. It is draft-first and read-only: the custom tool queries PostHog for how many distinct users reached each onboarding step over a recent window and computes the drop-off into every step, and the agent comes back with a nudge draft per high drop-off step for operator approval. It never sends messages or changes anything in PostHog.

The only custom tool is a small PostHog query reader that calls the project query API with your personal API key.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add onboarding-coach
```

Target overrides:

```bash
npx atom-eve add onboarding-coach --target eve
npx atom-eve add onboarding-coach --target flue
```

## Setup

Create a PostHog personal API key with query (read) access to your project, and note your project id.

Required environment variables:

```bash
POSTHOG_API_KEY=...
POSTHOG_PROJECT_ID=...
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

By default the tool inspects a generic `signed_up → onboarding_started → key_feature_used → activated` funnel over the last 7 days. If your activation definition uses different events, pass an ordered `steps` array and a `lookbackDays` value to the tool so the funnel matches your product.

## Usage

Run the agent manually to review the activation funnel and draft this run's nudges, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (runs at 09:00 UTC).
- Flue installs an agent plus `src/workflows/onboarding-coach-daily.ts`.

The agent reads the funnel, finds the steps where users drop off before activation, then drafts a nudge per step. Review and send approved nudges yourself, or add your own write tool.

## Connections and auth

This package uses a custom PostHog tool with env-token auth because the activation query endpoint is outside the framework-native toolset. The personal API key and project id are read by the installed project at runtime and used only for read-only queries.

## Limitations

- The reference implementation is read-only: it queries activation step counts and drafts nudges. It does not send messages, enroll users in flows, or change feature flags.
- Drop-off is computed per ordered step from distinct-user counts in the window, not a strict sequential funnel; treat it as guidance for where to nudge, not an exact funnel report.
- Sending nudges and any product or messaging changes are intentionally left to the operator or a write tool you add yourself.
- Always review drafted nudges and their target conditions before contacting real users.
