# Feedback Sweep Agent

## What it does

Reads recent [GitHub](https://github.com) issues for your configured repository and treats each one as a user correction or complaint. For every issue it produces a project-wide audit: the related spots in your codebase that likely share the same root cause (other call sites, duplicated copy, docs, tests, similar components), so a single complaint turns into a complete list of places to fix.

It is read-only and draft-first: the agent returns a prioritized audit grouped by the issue that motivates each fix. It never edits code, opens or closes issues, or comments. The only custom tool is a small GitHub issues reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add feedback-sweep
```

Target overrides:

```bash
npx atom-eve add feedback-sweep --target eve
npx atom-eve add feedback-sweep --target flue
```

## Setup

Create a GitHub personal access token (or fine-grained token) with read access to issues on the repository you want to audit.

Required environment variables:

```bash
GITHUB_TOKEN=...
GITHUB_REPO=owner/repo
```

`GITHUB_REPO` is the `owner/repo` slug of the repository whose issues you want to sweep. Configure both variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent issues and audit the project, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (Mondays at 09:00 UTC).
- Flue installs an agent plus `src/workflows/feedback-sweep-weekly.ts`.

The agent reads recent issues, classifies them, then sweeps the project for related spots and presents a prioritized audit. Apply approved fixes yourself, or add your own write tool.

## Connections and auth

This package uses a custom GitHub tool with env-token auth because the issues endpoint is outside the framework-native toolset. The token is read by the installed project at runtime and sent as a Bearer credential.

## Limitations

- The reference implementation is read-only: it only reads issues and proposes spots to fix. It does not edit code, comment, or change issue state.
- The GitHub issues endpoint also returns pull requests; the reader filters those out so the audit focuses on real issues.
- It reads up to 100 of the most recently updated issues per run; very large or noisy backlogs may need the `since`, `state`, or `limit` inputs to narrow scope.
- Always review the proposed audit before changing real code.
