# Analytics Digest Agent

## What it does

Pulls key event trends from your [PostHog](https://posthog.com) project and writes a plain-language weekly digest an operator can skim. It highlights the headline movement, calls out events that rose or fell materially week over week, and flags possible tracking regressions.

The agent uses framework-native agent, schedule, and workflow files. It queries PostHog through the official PostHog CLI (`posthog-cli`) running in the framework sandbox, not a hand-written REST client. It is read-only and draft-first: it never creates or edits dashboards, insights, or any PostHog configuration.

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

The agent runs the official PostHog CLI (`posthog-cli`) in the framework sandbox. For Eve, the installed sandbox bootstrap (`agent/sandbox/`) runs `setup-posthog-cli.sh`, which installs `@posthog/cli` the first time the sandbox starts. The first run may spend extra time while the sandbox template is built.

Create a personal API key in PostHog (Settings → Personal API keys) with read access, and note your project ID (Settings → Project).

Required environment variables:

```bash
POSTHOG_CLI_API_KEY=phx_...
POSTHOG_CLI_PROJECT_ID=12345
```

If your project is on the EU cloud or self-hosted, pass `--host` to the CLI (for example `--host https://eu.posthog.com`).

As an interactive alternative to the env vars, you can authenticate the CLI once with:

```bash
posthog-cli login
```

Configure the variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow. For Flue or another isolated sandbox, install `@posthog/cli` as part of that sandbox's setup/lifecycle so `posthog-cli` is on PATH.

## Usage

Run the agent manually to review recent event trends, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts`.
- Flue installs an agent plus `src/workflows/analytics-digest-weekly.ts`.

The agent runs `posthog-cli api` in the sandbox following the discover → info → call workflow: it searches for the right tool, reads the tool's schema with `posthog-cli api info`, confirms the events exist with `read-data-schema`, then calls the tool to read trends and writes a plain-language digest.

For lightweight run history, save the weekly digest somewhere your operator can review, such as `runs/analytics-digest/YYYY-MM-DD.md` or a team ticket/comment.

## Connections and auth

This package queries PostHog through the official `posthog-cli` running in the framework sandbox, declared as a `posthog-cli` custom-tool connection with env auth. The CLI reads `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` from the environment (or you can run `posthog-cli login` once). The agent never passes `--confirm`, so it cannot run PostHog's destructive tools.

## Limitations

- The agent is read-only and draft-first; it must follow the CLI's `posthog-cli api info <tool>` step before any call and never guesses tool names or schemas.
- It relies on `posthog-cli` being installed and authenticated in the runtime environment or Eve sandbox. If the CLI is unavailable, the agent reports the blocker instead of inventing numbers.
- Outputs are local Markdown digests. Save them externally if you want longer run history.
- PostHog person-property values reflect what was set at ingest time, not the person's current value. Always confirm surprising movements against PostHog directly before acting on them.
