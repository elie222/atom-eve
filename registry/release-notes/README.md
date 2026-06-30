# Release Notes

A GitHub-driven agent that reads merged pull requests and drafts user-facing release notes.

## What it does

Reviews pull requests merged since the latest release or tag, groups them by change type, and drafts user-facing Markdown release notes grounded in merged work.

It is draft-first and read-only: it never publishes a release, moves a tag, or edits changelog files.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add release-notes
```

This copies the agent into `agent/` in your eve app.

## Setup

Create a GitHub token with read access to repository contents and pull requests. The GitHub CLI reads it from `GH_TOKEN`/`GITHUB_TOKEN`.

Required environment variable for the agent's sandbox:

- `GITHUB_TOKEN` — token the GitHub CLI authenticates with.

Set the target repository in `owner/repo` form by passing `-R owner/repo` to `gh` or via `GH_REPO`. Edit `agent/instructions.md` to pin your repo and change-type conventions, and `agent/schedules/weekly.ts` before enabling the recurring run.

## Usage

Run the agent on demand to draft release notes for recent changes, or use the bundled weekly schedule (Mondays at 09:00 UTC). It uses:

```bash
gh release view -R owner/repo --json tagName,publishedAt
gh pr list -R owner/repo --state merged --json number,title,mergedAt,labels,url
gh pr diff -R owner/repo <number>
```

Review the Markdown draft, then publish the release from GitHub yourself.

## Connections and auth

This agent has no external channel connection. It reads GitHub through the official `gh` CLI inside the Eve sandbox, using `GITHUB_TOKEN` from the environment. It never runs write commands such as `gh release create`.

## Limitations

- The agent lists merged pull requests and drafts notes only; it does not publish releases or create or move tags.
- Pull request classification is heuristic, based on title prefixes and labels; review before publishing.
- It relies on `gh` being installed and authenticated; if unavailable, it reports the blocker.
- Outputs are session-local Markdown drafts unless you save them externally.
