# Repo Janitor Agent

## What it does

Plans proven low-risk repository cleanups so your tree stays tidy without risking working code. Given a file list or short repo description, the agent classifies files into proven low-risk cleanups (stale build/editor artifacts, backup files, log files) versus uncertain work that should be left alone, and returns a read-only checklist for tackling dead code and lint debt.

It is read-only and draft-first. It proposes cleanups one at a time with a rationale and a verification step, and it leaves anything that might still be load-bearing in a deferred list until a zero-reference check proves it is dead. The only custom tool is a small, network-free planner; it never reads the filesystem, calls an API, deletes files, or commits.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add repo-janitor
```

Target overrides:

```bash
npx atom-eve add repo-janitor --target eve
npx atom-eve add repo-janitor --target flue
```

## Setup

No setup or credentials are required. The agent works from the file list or repo description you provide in the prompt or local config notes. Edit `instructions.md` after install so the agent reflects your project's real layout, tooling, and cleanup conventions.

## Usage

Run the agent manually to plan a cleanup, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (cron `0 9 * * 1`).
- Flue installs an agent plus `src/workflows/repo-janitor-weekly.ts`.

Hand the agent a list of file paths (or a repo description). It uses the `plan_cleanup` tool to split them into proven low-risk cleanups and uncertain work, then drafts each proposed cleanup one at a time for your approval. Apply approved cleanups yourself, or add your own write tool.

## Connections and auth

None. This agent has no connections and reads no secrets. The planner is pure and network-free; the `fetch` integration is declared as a native capability but is not used to mutate anything.

## Limitations

- The planner is pure and network-free. It classifies the file paths you provide; it does not crawl your filesystem, run your linter, or compute real reference graphs. Dead-code and lint-debt steps are returned as a read-only checklist for the agent to execute with your project's own tooling.
- Stale-file detection is pattern-based (backup, temp, swap, log, OS-metadata names). Always confirm a file is unreferenced before removing it.
- The agent never deletes files, commits, opens pull requests, or claims anything was fixed. Apply approved cleanups yourself or add a write tool.
