# Release Notes Agent

A GitHub-driven agent that reads merged pull requests and drafts user-facing release notes for operator approval.

## What it does

Reviews the pull requests merged into your GitHub repository since the latest release or tag, groups them by change type (features, fixes, performance, refactors, docs, other), and drafts user-facing release notes grounded in that merged work. It is draft-first and read-only: every run returns Markdown release notes for operator approval, and the agent never publishes a release or moves a tag.

It reads GitHub through the official GitHub CLI (`gh`) running in the eve sandbox via the built-in `bash` tool, not a hand-written REST client. The capability is `gh` (`gh release view`, `gh pr list --state merged`, `gh pr view`, `gh pr diff`); the LLM does the classification and writing.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add release-notes
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a GitHub token (a fine-grained or classic personal access token, or a GitHub App token) with read access to the repository's contents and pull requests. The GitHub CLI reads it from `GH_TOKEN`/`GITHUB_TOKEN`.

Required environment variable for the agent's sandbox:

- `GITHUB_TOKEN` — token the GitHub CLI authenticates with.

Set the target repository in `owner/repo` form by passing `-R owner/repo` to `gh` or via `GH_REPO`. Edit `agent/instructions.md` to pin your repo and change-type conventions, and `agent/schedules/weekly.ts` before enabling the recurring run.

The sandbox bootstraps the `gh` binary on first run from the official linux-amd64 release tarball, so the first run may spend extra time while the sandbox template is built.

## Usage

Run the agent on demand to draft release notes for the latest changes, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically in task mode: eve starts the agent on its cron tick and the draft lands in that run's session.

The agent drives `gh` in the sandbox:

```bash
gh release view -R owner/repo --json tagName,publishedAt
gh pr list -R owner/repo --state merged --json number,title,mergedAt,labels,url
gh pr diff -R owner/repo <number>
```

It returns the release notes as a Markdown draft. Review it, then publish the release from GitHub yourself.

## Connections and auth

This agent has no external channel connection. It reads GitHub through the official `gh` CLI inside the eve sandbox, which reads `GITHUB_TOKEN` from the environment. The agent never runs write commands such as `gh release create`, so it cannot publish releases or move tags.

## Limitations

- The agent is read-only by design: it lists merged pull requests and drafts notes, but does not publish releases, create or move tags, or edit changelog files.
- Pull request classification is heuristic, based on conventional-commit title prefixes and labels; review and re-group entries before publishing.
- It relies on `gh` being installed and authenticated in the sandbox. If the CLI or token is unavailable, the agent reports the blocker instead of inventing entries.
- Outputs are session-local Markdown drafts. Save them externally if you want longer history.
