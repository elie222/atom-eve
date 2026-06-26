# Experiment Analyst Agent

## What it does

Reviews your A/B experiments in PostHog, checks statistical significance, calls a winning variant where the data supports it, and summarizes the practical learnings for an operator to act on.

The agent queries PostHog through the official PostHog CLI (`@posthog/cli`) running in the framework's built-in command/sandbox capability, instead of a hand-written REST client. The CLI's `posthog-cli api` interface exposes PostHog's full MCP tool surface and handles auth, so the agent discovers the right experiment tools at runtime and never guesses endpoints. There is no custom tool in this package.

The package includes:

- Framework-native agent, schedule, and workflow files.
- An Eve sandbox bootstrap that installs `posthog-cli` in the Eve sandbox.
- Root-agent instructions enforcing the read-only discover -> info -> call workflow.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add experiment-analyst
```

Target overrides:

```bash
npx atom-eve add experiment-analyst --target eve
npx atom-eve add experiment-analyst --target flue
```

## Setup

The agent authenticates the PostHog CLI from the environment. Create a PostHog personal API key and find your numeric project ID in PostHog project settings, then set:

```bash
POSTHOG_CLI_API_KEY=phx_...
POSTHOG_CLI_PROJECT_ID=12345
```

For EU Cloud or self-hosted PostHog, pass `--host` (for example `--host https://eu.posthog.com`) on the CLI commands.

As an interactive alternative to the env vars, you can run `posthog-cli login` once where the sandbox runs commands.

For Eve, no custom tool dependency is required. The installed sandbox bootstrap runs `bash setup-posthog-cli.sh` to install `posthog-cli` inside the Eve sandbox; the first run may spend extra time while the sandbox template is built. For Flue, install `@posthog/cli` where the sandbox can run commands, or include it in that sandbox's setup/lifecycle.

Configure the env vars in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review current experiments, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (runs Mondays at 09:00 UTC) and the sandbox bootstrap under `agent/sandbox/`.
- Flue installs an agent plus `src/workflows/experiment-analyst-weekly.ts`.

The agent runs `posthog-cli` in the sandbox following the mandatory workflow: discover the current experiment tools with `posthog-cli api search experiment`, inspect each tool with `posthog-cli api info <tool>` before calling it, confirm events/properties with `posthog-cli api call read-data-schema ...`, then read results with `posthog-cli api call <tool>`. It names a winner only when an experiment is significant and returns conservative recommendations. It does not roll out variants or change feature flags.

For lightweight run history, save the weekly response somewhere your operator can review, such as `runs/experiment-analyst/YYYY-MM-DD.md` or a team ticket/comment. Including prior summaries in the next prompt lets the agent describe how an experiment progressed toward significance without needing a database.

## Connections and auth

This package uses the `posthog-cli` connection with env-token auth. The CLI reads `POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID` at runtime; `posthog-cli login` is the interactive alternative. No credentials are committed to the registry.

## Limitations

- The agent is strictly read-only. It only reads experiment configuration and results and never mutates anything. PostHog's destructive CLI tools require `--confirm` and are not used.
- It calls a winner only when PostHog reports the experiment as significant; significance and probability come straight from PostHog's computed results.
- Querying PostHog depends on `posthog-cli` being available in the runtime environment or Eve sandbox. If the CLI or auth is unavailable, the agent reports that blocker instead of inventing results.
- It reviews the current experiment list. Save weekly outputs externally if you want longer run history.
- Always review recommendations before rolling out a variant or changing live feature flags.
