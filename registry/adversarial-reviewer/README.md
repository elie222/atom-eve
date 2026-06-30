# Adversarial Reviewer

A GitHub-driven agent that gives open pull requests a skeptical second review.

## What it does

Reads a pull request and its diff, then looks for issues a first review may have missed: correctness bugs, security holes, data loss, breaking changes, and missing tests on risky paths. It separates blocking concerns from nits and grounds each objection in a specific file or hunk.

It is read-only: it never approves, merges, requests changes, posts comments, or claims any change was made.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add adversarial-reviewer
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a GitHub token with read access to the repository's pull requests. The GitHub CLI reads it from `GH_TOKEN`/`GITHUB_TOKEN`.

Required environment variable for the agent's sandbox:

- `GITHUB_TOKEN` — token the GitHub CLI authenticates with.

Set the target repository in `owner/repo` form by passing `-R owner/repo` to `gh` or via `GH_REPO`. Edit `agent/instructions.md` to pin your repo and review checklist.

## Usage

Run it on demand with a PR number, for example:

```text
Give me an adversarial review of PR #128.
```

You can also ask it to triage open PRs. It uses `gh pr list`, `gh pr view`, and `gh pr diff`, then returns objections in priority order for you to weigh.

## Connections and auth

This agent has no external channel connection. It reads GitHub through the official `gh` CLI inside the Eve sandbox, using `GITHUB_TOKEN` from the environment.

## Limitations

- Read-only by design: it does not approve, merge, request changes, or post review comments.
- It relies on `gh` being installed and authenticated in the sandbox; if unavailable, it reports the blocker.
- Large diffs may be truncated; the response flags what it could inspect.
- It does not run code, execute tests, or check CI status.
