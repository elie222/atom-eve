# Release Notes Agent

## What it does

Reviews the pull requests merged into your GitHub repository since the latest release or tag, groups them by change type (features, fixes, performance, refactors, docs, other), and drafts user-facing release notes grounded in that merged work. It is draft-first and read-only: every run returns Markdown release notes for operator approval, and the agent never publishes a release or moves a tag on its own.

The only custom tool is a small GitHub API reader that resolves the latest release/tag, collects merged pull requests since then, and classifies each one.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add release-notes
```

Target overrides:

```bash
npx atom-eve add release-notes --target eve
npx atom-eve add release-notes --target flue
```

## Setup

Create a GitHub personal access token (or fine-grained token) with read access to the repository's contents and pull requests.

Required environment variables:

```bash
GITHUB_TOKEN=...
GITHUB_REPO=owner/repo
```

`GITHUB_REPO` must be in `owner/repo` form. Configure both variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to draft release notes for the latest changes, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (Mondays at 09:00).
- Flue installs an agent plus `src/workflows/release-notes-weekly.ts`.

The agent reads the merged pull requests since your latest release, groups them by change type, and drafts the notes as Markdown. Review the draft, then publish the release from GitHub yourself or add your own write tool.

## Connections and auth

This package uses a custom GitHub tool with env-token auth because resolving the latest release and searching merged pull requests is outside the framework-native toolset. `GITHUB_TOKEN` and `GITHUB_REPO` are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only: it lists merged pull requests and drafts notes, but does not publish releases, create or move tags, or edit changelog files.
- Pull request classification is heuristic, based on conventional-commit title prefixes and labels; review and re-group entries before publishing.
- Merged pull requests are read from the GitHub search API and capped at the first 100 results since the latest release/tag.
- Always review drafted release notes before publishing them to users.
