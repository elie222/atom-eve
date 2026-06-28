# Value Propagation Agent

## What it does

When a value changes in your project, this agent plans a read-only audit to find every stale copy of the old value across code, docs, and config, then proposes how to fix each one. You give it the old value, the new value, and any context; it returns the search terms to grep for (including casing and whitespace variants), the code/docs/config areas to scan, and an ordered fix plan.

It is draft-first and read-only. The agent greps for the value, triages each hit to confirm it is the same value rather than a coincidental substring, and presents the exact old -> new edits as a reviewable per-file diff for approval. It never edits files, commits, or claims the change was applied. The only custom tool is a small, network-free planner.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add value-propagation
```

Target overrides:

```bash
npx atom-eve add value-propagation --target eve
npx atom-eve add value-propagation --target flue
```

## Setup

No environment variables or external credentials are required. After install, edit the installed instructions to match how your project stores shared constants (for example which files are the single source of truth) so the audit guidance fits your repository.

## Usage

Run the agent on demand when a value changes. Tell it the old value, the new value, and any context, for example:

> The pricing page URL changed from `https://old.example.com` to `https://new.example.com`. Find every stale copy and propose the fixes.

The agent calls the propagation planner to get the search terms, audit targets, and fix plan, then greps the repository, triages the hits, and presents the proposed old -> new diffs for your approval. Where the value is duplicated many times, it suggests centralizing it into a single shared constant or env var. This agent is on-demand and installs no schedule or workflow.

## Connections and auth

This package declares no connections and no required environment variables. The planner is a pure, network-free function: it does not read the filesystem or call any API. The agent uses its own framework-native file search to run the plan.

## Limitations

- The planner suggests search terms and areas to scan; the agent does the actual grepping with native capabilities, so coverage depends on the project's files being readable.
- It proposes edits as diffs only. Applying the edits, committing, or opening a pull request is intentionally left to the operator or a write tool you add yourself.
- Coincidental substrings and unrelated values that share text with the old value must be triaged manually before any edit is approved.
- Always review the proposed diffs before changing anything in a real repository.
