# Experiment Analyst Agent

A PostHog experiment agent that reviews A/B results and summarizes learnings for an operator.

## What it does

Reviews your A/B experiments in [PostHog](https://posthog.com), checks statistical significance, calls a winning variant where the data supports it, and summarizes the practical learnings for an operator to act on.

It queries PostHog through the official PostHog CLI (`posthog-cli`) running in the eve sandbox, not a hand-written REST client. The CLI's `posthog-cli api` interface exposes PostHog's full tool surface and handles auth, so the agent follows a mandatory discover -> info -> call workflow and never guesses endpoints. It is read-only: it reads experiment configuration and results and never rolls out a variant, changes a feature flag, or starts or stops an experiment.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add experiment-analyst
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a personal API key in PostHog (Settings -> Personal API keys) with read access, and note your project ID (Settings -> Project). Set these environment variables for the agent's sandbox:

- `POSTHOG_CLI_API_KEY` — PostHog personal API key for the CLI.
- `POSTHOG_CLI_PROJECT_ID` — PostHog project id.

If your project is on the EU cloud or self-hosted, pass `--host` to the CLI (for example `--host https://eu.posthog.com`). `posthog-cli login` is the interactive alternative to the env vars.

The sandbox bootstraps the `posthog-cli` binary on first run, so the first run may spend extra time while the sandbox template is built.

## Usage

Ask the agent to review current experiments on demand, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent runs `posthog-cli` following the mandatory workflow: discover the experiment tools with `posthog-cli api search experiment`, inspect each tool with `posthog-cli api info <tool>` before calling it, confirm events with `posthog-cli api call read-data-schema`, then read results with `posthog-cli api call <tool>`. It names a winner only when an experiment is significant and returns conservative recommendations for operator approval.

## Connections and auth

This agent has no external channel connection. It queries PostHog through the official `posthog-cli` running in the eve sandbox, which reads `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment. The agent never passes `--confirm`, so it cannot run PostHog's destructive tools.

## Limitations

- The agent is strictly read-only. It only reads experiment configuration and results and never mutates anything. PostHog's destructive CLI tools require `--confirm` and are not used.
- It calls a winner only when PostHog reports the experiment as significant; significance and probability come straight from PostHog's computed results.
- It relies on `posthog-cli` being installed and authenticated in the sandbox. If the CLI or auth is unavailable, the agent reports the blocker instead of inventing results.
- Outputs are session-local Markdown reports. Save them externally if you want longer run history.
