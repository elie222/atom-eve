# Flaky Test Fixer Agent

## What it does

Reviews recent [GitHub Actions](https://docs.github.com/actions) CI runs for a repository, groups them by workflow, and surfaces tests or workflows that fail repeatedly or were re-run. It classifies each workflow as a likely flake, a likely real break, or healthy, and returns evidence plus a read-only fix plan for an operator to approve.

The agent uses framework-native agent, schedule, and workflow files. The only custom tool is a small GitHub Actions runs reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add flaky-test-fixer
```

Target overrides:

```bash
npx atom-eve add flaky-test-fixer --target eve
npx atom-eve add flaky-test-fixer --target flue
```

## Setup

Create a GitHub token (fine-grained or classic) with read access to Actions for the repository you want the agent to inspect. Do not grant write/contents/workflow scopes unless you intentionally add your own write tools later.

Required environment variables:

```bash
GITHUB_TOKEN=...
GITHUB_REPO=owner/repo
```

`GITHUB_REPO` must be in `owner/repo` format. Optional overrides: `FLAKY_TEST_LOOKBACK_RUNS` (default 50), `FLAKY_TEST_BRANCH` (default all branches), and `GITHUB_API_URL` (default `https://api.github.com`, set for GitHub Enterprise). Configure these in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent CI runs, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts`.
- Flue installs an agent plus `src/workflows/flaky-test-fixer-weekly.ts`.

The agent reads the most recent workflow runs, counts failures, successes, and re-runs per workflow, flags commits that both failed and passed, and returns suggested diagnoses. It never re-runs jobs or changes code or CI configuration.

Local smoke test with a mocked GitHub response:

```bash
GITHUB_TOKEN=test GITHUB_REPO=acme/app pnpm dlx tsx -e '
import { reviewCiRuns } from "./agent/lib/github.ts";
const payload = {
  workflow_runs: [
    { name: "CI", path: ".github/workflows/ci.yml", head_sha: "abc", status: "completed", conclusion: "failure", run_attempt: 1, html_url: "https://github.com/acme/app/actions/runs/1" },
    { name: "CI", path: ".github/workflows/ci.yml", head_sha: "abc", status: "completed", conclusion: "success", run_attempt: 2, html_url: "https://github.com/acme/app/actions/runs/1" }
  ]
};
const fetchMock = async () => new Response(JSON.stringify(payload));
void (async () => {
  console.log(JSON.stringify(await reviewCiRuns({}, fetchMock as typeof fetch), null, 2));
})();
'
```

Run the smoke test from an installed Eve app folder after `npx atom-eve add flaky-test-fixer --target eve`. For Flue, change the import path to `./src/lib/agents/flaky-test-fixer/github.ts`.

## Connections and auth

This package uses a custom GitHub tool with env-token auth because the GitHub Actions runs endpoint is outside the framework-native toolset. The token is read by the installed project at runtime.

## Limitations

- The reference implementation is read-only and only calls the Actions runs endpoint; it does not fetch per-job logs or step-level detail.
- Flake classification is heuristic, based on re-run signals and intermittent pass/fail patterns within the analyzed window. Always inspect the linked job logs before quarantining or retrying a test.
- It analyzes one page of recent runs (up to 100). Narrow with `FLAKY_TEST_BRANCH` or the `workflow` filter, or extend the tool for longer history.
- It never re-runs workflows, pushes commits, changes CI configuration, or opens pull requests or issues.
