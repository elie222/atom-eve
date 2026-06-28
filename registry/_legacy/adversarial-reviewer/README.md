# Adversarial Reviewer Agent

## What it does

Reads a single GitHub pull request and its unified diff, then produces an independent, skeptical second-opinion review. It looks for what the first review missed: correctness bugs, security holes, data loss, breaking changes, and missing tests on risky paths, with blocking concerns separated from nits and each objection grounded in a specific file and hunk.

It is read-only. The only custom tool is a small GitHub PR reader; the agent never approves, merges, requests changes, posts comments, or claims any change was made.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add adversarial-reviewer
```

Target overrides:

```bash
npx atom-eve add adversarial-reviewer --target eve
npx atom-eve add adversarial-reviewer --target flue
```

## Setup

Create a GitHub token (a fine-grained or classic personal access token, or a GitHub App token) with read access to the repository's pull requests. Set the repository you want reviewed in `owner/repo` form.

Required environment variables:

```bash
GITHUB_TOKEN=...
GITHUB_REPO=owner/repo
```

Configure these variables in your local shell and in the deployment environment that runs the agent.

## Usage

This agent is on-demand: there is no schedule or workflow. Run it and pass the pull request number you want a second opinion on, for example "Give me an adversarial review of PR #128." The agent reads the PR and its diff with the `review_pull_request` tool, then returns its objections in priority order for you to weigh.

## Connections and auth

This package uses a custom GitHub tool with env-token auth because reading a pull request and its diff is outside the framework-native toolset. `GITHUB_TOKEN` and `GITHUB_REPO` are read by the installed project at runtime.

## Limitations

- Read-only by design: it reads one PR plus its diff and does not approve, merge, request changes, or post review comments.
- It reviews a single PR at a time and reads only the configured `GITHUB_REPO`.
- Large diffs are truncated before being handed to the model; the response flags truncation so the review can be scoped to what was seen.
- It does not run the code, execute tests, or check CI status; objections are based on reading the diff.
