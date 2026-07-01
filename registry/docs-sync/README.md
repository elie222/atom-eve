# Docs Sync

## What it does

Hands you the docs changes to ship next, grounded in the code that just changed.

Each run it:
- reads recent merged PRs, changed source, public APIs, CLI commands, config schemas, and examples
- compares what the code now does with what the docs still say
- flags stale or missing docs, ordered by impact on installing, configuring, or migrating
- drafts concrete edits with target file, current problem, and replacement text
- drafts a PR title and body for the sync

Every finding is tied to a code reference and a docs reference; anything unverifiable is marked unknown.

## Setup

Create a GitHub token with read access to repository contents, pull requests, releases, and issues.

Set the target repository, docs paths, source paths, and any release or changelog window in `agent/instructions.md`.
