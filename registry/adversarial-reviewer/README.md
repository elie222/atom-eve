# Adversarial Reviewer Agent

A GitHub-driven agent that reads open pull requests and returns an independent, skeptical second-opinion review.

## What it does

Reads a GitHub pull request and its unified diff, then produces an independent, skeptical second-opinion review. It looks for what the first review missed: correctness bugs, security holes, data loss, breaking changes, and missing tests on risky paths, with blocking concerns separated from nits and each objection grounded in a specific file and hunk.

It reads GitHub through the official GitHub CLI (`gh`) running in the eve sandbox via the built-in `bash` tool, not a hand-written REST client. The capability is `gh` (`gh pr list`, `gh pr view`, `gh pr diff`); the LLM does the review judgment. It is read-only: it never approves, merges, requests changes, posts comments, or claims any change was made.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add adversarial-reviewer
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a GitHub token (a fine-grained or classic personal access token, or a GitHub App token) with read access to the repository's pull requests. The GitHub CLI reads it from `GH_TOKEN`/`GITHUB_TOKEN`.

Required environment variable for the agent's sandbox:

- `GITHUB_TOKEN` — token the GitHub CLI authenticates with.

Set the target repository in `owner/repo` form by passing `-R owner/repo` to `gh` or via `GH_REPO`. Edit `agent/instructions.md` to pin your repo and review checklist.

The sandbox bootstraps the `gh` binary on first run from the official linux-amd64 release tarball, so the first run may spend extra time while the sandbox template is built.

## Usage

This agent is on-demand: there is no schedule. Run it and pass the pull request number you want a second opinion on, for example "Give me an adversarial review of PR #128", or ask it to triage the open PRs. The agent drives `gh` in the sandbox:

```bash
gh pr list -R owner/repo --state open --json number,title,author,url
gh pr view <number> -R owner/repo --json title,body,labels,files
gh pr diff <number> -R owner/repo
```

It returns its objections in priority order for you to weigh.

## Connections and auth

This agent has no external channel connection. It reads GitHub through the official `gh` CLI inside the eve sandbox, which reads `GITHUB_TOKEN` from the environment. The agent never runs write commands, so it cannot approve, merge, comment on, or otherwise change a pull request.

## Limitations

- Read-only by design: it reads PRs plus diffs and does not approve, merge, request changes, or post review comments.
- It relies on `gh` being installed and authenticated in the sandbox. If the CLI or token is unavailable, the agent reports the blocker instead of guessing.
- Large diffs may be truncated; the response flags truncation so the review can be scoped to what was seen.
- It does not run the code, execute tests, or check CI status; objections are based on reading the diff.
