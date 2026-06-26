# Experiment Analyst Agent

## What it does

Reviews your A/B experiments in PostHog, checks statistical significance, calls a winning variant where the data supports it, and summarizes the practical learnings for an operator to act on.

The agent uses framework-native agent, schedule, and workflow files. The only custom tool is a small PostHog API reader that fetches experiment configuration and results.

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

Create a PostHog personal API key with read access to your project, then find the numeric project ID in your PostHog project settings.

Required environment variables:

```bash
POSTHOG_API_KEY=phx_...
POSTHOG_PROJECT_ID=12345
```

The agent calls `https://us.posthog.com` by default. If you are on EU Cloud or self-hosted PostHog, set an optional `POSTHOG_HOST` (for example `https://eu.posthog.com`). Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review current experiments, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (runs Mondays at 09:00 UTC).
- Flue installs an agent plus `src/workflows/experiment-analyst-weekly.ts`.

The agent reads the project's experiments, derives each experiment's status, reads significance and per-variant probabilities, names a winner only when an experiment is significant, and returns conservative recommendations. It does not roll out variants or change feature flags.

For lightweight run history, save the weekly response somewhere your operator can review, such as `runs/experiment-analyst/YYYY-MM-DD.md` or a team ticket/comment. Including prior summaries in the next prompt lets the agent describe how an experiment progressed toward significance without needing a database.

Local smoke test with a mocked PostHog response:

```bash
POSTHOG_API_KEY=test POSTHOG_PROJECT_ID=12345 pnpm dlx tsx -e '
import { fetchExperiments, recommendExperimentActions } from "./agent/lib/posthog.ts";
const responses = [
  { results: [{ id: 1, name: "Pricing page CTA", feature_flag_key: "pricing-cta", start_date: "2026-06-01", end_date: "2026-06-20", archived: false, parameters: { feature_flag_variants: [{ key: "control" }, { key: "test" }] } }] },
  { significant: true, significance_code: "significant", probability: { control: 0.03, test: 0.97 } }
];
const fetchMock = async () => new Response(JSON.stringify(responses.shift()));
void (async () => {
  const experiments = await fetchExperiments(fetchMock as typeof fetch);
  console.log(JSON.stringify({ experiments, recommendations: recommendExperimentActions(experiments) }, null, 2));
})();
'
```

Run the smoke test from an installed Eve app folder after `npx atom-eve add experiment-analyst --target eve`. For Flue, change the import path to `./src/lib/agents/experiment-analyst/posthog.ts`.

## Connections and auth

This package uses a custom PostHog tool with env-token auth because the PostHog experiments and results endpoints are outside the framework-native toolset. The personal API key and project ID are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only and only calls the experiments and results endpoints.
- It calls a winner only when PostHog reports the experiment as significant; the significance and probability fields come straight from PostHog's computed results.
- Results are fetched per experiment best-effort; an experiment whose results cannot be loaded is reported with unknown significance rather than failing the whole review.
- It reviews the current experiment list. Save weekly outputs externally if you want longer run history.
- Always review recommendations before rolling out a variant or changing live feature flags.
