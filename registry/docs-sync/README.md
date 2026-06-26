# Docs Sync Agent

## What it does

Reviews this project's recent commits and merged pull requests on [GitHub](https://github.com), flags documentation that has likely drifted from the code, and proposes a reviewable doc update. It is draft-first and read-only: it lists the code changes and docs touched in the window, raises drift flags with a severity, and hands back a proposed update for you to review. It never opens a pull request or edits a file on its own.

The only custom tool is a small GitHub API reader that fetches recent commit details and merged pull requests, then derives drift flags locally.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add docs-sync
```

Target overrides:

```bash
npx atom-eve add docs-sync --target eve
npx atom-eve add docs-sync --target flue
```

## Setup

Create a GitHub personal access token (classic or fine-grained) with read access to the repository's contents and pull requests.

Required environment variables:

```bash
GITHUB_TOKEN=...
GITHUB_REPO=owner/repo
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent changes and surface drifted docs, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts`.
- Flue installs an agent plus `src/workflows/docs-sync-daily.ts`.

The agent reads recent commits and merged pull requests, flags documentation that may be out of date, and returns a proposed update as a draft. Review the proposal, edit the flagged docs, and open the pull request yourself, or add your own write tool.

## Connections and auth

This package uses a custom GitHub tool with env-token auth because the commit and pull-request review logic is outside the framework-native toolset. `GITHUB_TOKEN` and `GITHUB_REPO` are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only: it reads commits and merged pull requests and proposes a doc update, but it does not open pull requests, push commits, or edit files.
- Drift detection is heuristic. It flags documentation based on which files changed in the window and does not deeply parse code or doc semantics.
- The commit window is bounded for API efficiency, so very large or very old change sets may be truncated. Tune `lookbackDays` when invoking the tool directly.
- Always review the proposed update before applying it to real documentation.
