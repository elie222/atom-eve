# Release Notes

## What it does

Reviews pull requests merged since the latest release or tag, classifies each by change type (features, fixes, performance, refactors, docs, other) from its title and labels, and drafts user-facing release notes in plain language with a summary per entry. Entries whose type is ambiguous are flagged for a human regroup. If the repo has no prior release or tag, it summarizes recent merged history instead.

## Setup

Provide a GitHub token with read access to repository contents and pull requests; the `gh` CLI authenticates from it. Pin the target repository and your change-type conventions in `agent/instructions.md`.
