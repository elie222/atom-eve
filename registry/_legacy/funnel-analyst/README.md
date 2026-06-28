# Funnel Analyst Agent

## What it does

Builds funnels and retention/cohort views from your [PostHog](https://posthog.com) project, finds the biggest conversion drop-offs, and recommends where the team should focus. It is read-only: it queries PostHog for funnel and retention data, then returns a Markdown report with the largest drop-off step, the retention trend, and concrete next steps. It does not change events, insights, dashboards, cohorts, or any PostHog configuration.

Instead of a hand-written REST client, the agent queries PostHog through the official PostHog CLI (`posthog-cli`) inside the framework sandbox. The CLI's `api` interface exposes PostHog's full tool surface and handles auth. The agent follows a mandatory discover (`posthog-cli api search`/`tools`) -> inspect (`posthog-cli api info <tool>`) -> confirm (`posthog-cli api call read-data-schema`) -> call (`posthog-cli api call <tool>`) workflow so it never guesses tool names or schemas.

The package includes:

- Shared instructions describing the read-only `posthog-cli api` workflow.
- An Eve sandbox bootstrap that installs `@posthog/cli` in the Eve sandbox.
- A weekly schedule (Eve) and workflow (Flue) that trigger the review.

The Eve target installs this as a root agent under `agent/` and uses Eve's built-in `bash` tool to run `posthog-cli` in the sandbox. The Flue target uses Flue's built-in sandbox command capability.

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

The agent authenticates the PostHog CLI from environment variables. Create a PostHog personal API key with read access to your project, and note your numeric project ID (from project settings or the URL `/project/<id>`).

Required environment variables:

```bash
POSTHOG_CLI_API_KEY=...
POSTHOG_CLI_PROJECT_ID=...
```

Optional: pass `--host` to `posthog-cli` for a non-default region or self-hosted instance.

As an interactive alternative to the env vars, you can run:

```bash
posthog-cli login
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow. For Eve, the installed sandbox bootstrap (`setup-posthog-cli.sh`) installs `@posthog/cli` inside the sandbox on first run; the first run may spend extra time while the sandbox template is built. For Flue or another isolated sandbox, install `@posthog/cli` as part of that sandbox's setup/lifecycle.

## Usage

Run the agent manually to review a funnel, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (cron `0 9 * * 1`).
- Flue installs an agent plus `src/workflows/funnel-analyst-weekly.ts`.

Give the agent your business context and the real product event names. It discovers the right PostHog tools with `posthog-cli api`, confirms the events exist with `read-data-schema`, builds the funnel and retention/cohort views, identifies the biggest drop-off, summarizes the retention curve, and recommends where to focus. Act on the recommendations in PostHog yourself, or add your own write tool.

## Connections and auth

This package uses the official PostHog CLI (`posthog-cli`) run in the framework sandbox, with env-token auth via `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID`. There is no custom REST client; the CLI handles auth and exposes PostHog's full tool surface. The interactive `posthog-cli login` is an alternative for local use.

## Limitations

- The agent is read-only: it queries funnel and retention data and recommends actions, but never creates or edits insights, dashboards, cohorts, or events. PostHog's destructive tools require `--confirm` and are not used.
- PostHog access depends on `posthog-cli` being available in the runtime environment or Eve sandbox; if it is unavailable or auth is missing, the agent reports the blocker instead of inventing numbers.
- Reports are returned in the agent response; wire them to your own storage if you need long-term history.
- Always confirm the funnel definition and event names match the intended user journey before acting on the recommendations.
