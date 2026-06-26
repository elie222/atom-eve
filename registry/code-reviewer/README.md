# Code Reviewer Agent

## What it does

Reviews the configured repository's open [GitHub](https://github.com) pull requests and drafts read-only review notes. For each open PR it lists the changed files, reads the diff, and flags two classes of issues: correctness (missing test coverage, leftover `console.log`/`debugger`, added TODO/FIXME) and simplification (oversized PRs, single huge files, loose `any` typing). It is draft-first: every note is an operator-ready suggestion, and the agent does not post comments, approve, request changes, or merge anything.

The only custom tool is a small GitHub pull request reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add code-reviewer
```

Target overrides:

```bash
npx atom-eve add code-reviewer --target eve
npx atom-eve add code-reviewer --target flue
```

## Setup

Create a GitHub token (a fine-grained or classic personal access token, or a GitHub App installation token) with read access to the repository's pull requests and contents.

Required environment variables:

```bash
GITHUB_TOKEN=...
GITHUB_REPO=owner/repo
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review the current open pull requests, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (cron `0 9 * * *`).
- Flue installs an agent plus `src/workflows/code-reviewer-daily.ts`.

The agent reads each open PR's files and diff, then returns per-PR draft review notes with a severity for each finding. Act on the notes yourself in GitHub, or add your own write tool to post comments.

## Connections and auth

This package uses a custom GitHub tool with env-token auth because the pull request list and files endpoints are outside the framework-native toolset. `GITHUB_TOKEN` and `GITHUB_REPO` are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only: it lists open pull requests and reads their files/diff, and it never posts comments, approves, requests changes, or merges.
- Flags come from lightweight static heuristics over the diff, not a full semantic analysis. Always do a focused manual read before relying on a finding.
- The GitHub `pulls/files` endpoint truncates very large diffs and omits the patch for binary or generated files, so those files are summarized by counts only.
