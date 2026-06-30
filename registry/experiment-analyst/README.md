# Experiment Analyst

A PostHog experiment agent that reviews A/B results and summarizes learnings for an operator.

## What it does

Reviews A/B experiments in [PostHog](https://posthog.com), checks statistical significance, calls a winning variant when the data supports it, and summarizes practical learnings for operator approval.

It is read-only: it reads experiment configuration and results, but never rolls out a variant, changes a feature flag, or starts or stops an experiment.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add experiment-analyst
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a PostHog personal API key with read access and note your project ID. Set:

- `POSTHOG_CLI_API_KEY` — PostHog personal API key for the CLI.
- `POSTHOG_CLI_PROJECT_ID` — PostHog project id.

For EU cloud or self-hosted PostHog, pass `--host` to the CLI, for example `--host https://eu.posthog.com`. `posthog-cli login` is the interactive alternative to env vars.

## Usage

Ask the agent to review current experiments on demand, or use the bundled weekly schedule (Mondays at 09:00 UTC). It confirms event definitions, reads experiment results through `posthog-cli`, names a winner only when significant, and returns conservative recommendations.

## Connections and auth

This agent has no external channel connection. It queries PostHog through the official `posthog-cli`, using `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment. It never passes `--confirm`, so it cannot run destructive PostHog tools.

## Limitations

- The agent is strictly read-only and never mutates PostHog experiments or feature flags.
- It calls a winner only when PostHog reports the experiment as significant.
- It relies on `posthog-cli` being installed and authenticated; if unavailable, it reports the blocker.
- Outputs are session-local Markdown reports unless you save them externally.
