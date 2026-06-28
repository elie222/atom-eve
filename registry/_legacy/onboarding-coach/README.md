# Onboarding Coach Agent

## What it does

Finds users who get stuck before activation in [PostHog](https://posthog.com) and drafts the right nudge for each onboarding step. It is draft-first and read-only: it reads the activation funnel, identifies where users drop off before activation, and comes back with a nudge draft per high drop-off step for operator approval. It never sends messages or changes anything in PostHog.

Instead of a hand-written REST client, this agent queries PostHog through the official PostHog CLI (`posthog-cli`) inside the framework sandbox. The CLI's `api` interface exposes PostHog's full tool surface (the same tools as the PostHog MCP) and handles auth, so the agent follows a robust discover -> info -> call workflow rather than guessing endpoints.

The package includes:

- Framework-native sandbox instructions for running `posthog-cli`.
- Eve sandbox bootstrap that installs the PostHog CLI inside the Eve sandbox.
- Root-agent instructions you should customize with your own activation events, drop-off thresholds, and nudge policy.

The Eve target installs this as a root agent under `agent/` and uses Eve's built-in `bash` tool to run `posthog-cli` in the sandbox. The Flue target uses Flue's built-in sandbox command capability.

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

Create a PostHog personal API key with read access to your project, and note your project id. The PostHog CLI reads them from the environment:

```bash
POSTHOG_CLI_API_KEY=...
POSTHOG_CLI_PROJECT_ID=...
```

For EU or self-hosted PostHog, pass `--host` to `posthog-cli`. As an interactive alternative to the env vars, run `posthog-cli login` once in the environment that runs the agent.

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow. The installed Eve sandbox bootstrap runs `setup-posthog-cli.sh`, which installs `@posthog/cli`; the first run may spend extra time while the sandbox template is built.

By default the agent inspects a generic `signed_up -> onboarding_started -> key_feature_used -> activated` funnel. If your activation definition uses different events, tell the agent your ordered activation events and lookback window so the funnel matches your product. The agent confirms events exist via `posthog-cli api call read-data-schema` before analyzing.

## Usage

Run the agent manually to review the activation funnel and draft this run's nudges, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (runs at 09:00 UTC).
- Flue installs an agent plus `src/workflows/onboarding-coach-daily.ts`.

The agent runs `bash setup-posthog-cli.sh`, then uses `posthog-cli api` following the mandatory discover -> info -> call workflow:

```bash
posthog-cli api search <regex>      # or: posthog-cli api tools
posthog-cli api info <tool>          # REQUIRED before any call
posthog-cli api call read-data-schema '<json>'   # confirm events/properties exist
posthog-cli api call <tool> '<json>'
```

It then drafts a nudge per high drop-off step. Review and send approved nudges yourself, or add your own write tool.

## Connections and auth

This package uses the `posthog-cli` connection with env auth: the PostHog CLI is installed in the framework sandbox and reads `POSTHOG_CLI_API_KEY` / `POSTHOG_CLI_PROJECT_ID` from the environment. There is no custom in-app REST tool. PostHog destructive tools require a `--confirm` flag; this agent does not use them and stays read-only.

## Limitations

- The agent is read-only by design: it reads funnel data and drafts nudges. It does not send messages, enroll users in flows, or change feature flags.
- It depends on `posthog-cli` being installable/available in the runtime or Eve sandbox; if the CLI or auth is missing, it reports that blocker instead of inventing funnel numbers.
- Sending nudges and any product or messaging changes are intentionally left to the operator or a write tool you add yourself.
- Always review drafted nudges and their target conditions before contacting real users.
