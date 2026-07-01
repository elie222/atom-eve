# Release Notes

## What it does

Turns the pull requests merged since your last release into user-facing release notes, ready for your approval. It:

- reviews PRs merged since the latest release or tag
- classifies each by change type (features, fixes, performance, refactors, docs, other) from its title and labels
- drafts plain-language notes with a short summary per entry
- flags ambiguous entries for a human regroup

If the repo has no prior release or tag, it summarizes recent merged history instead.

## Setup

Provide a GitHub token with read access to the repository's contents and pull requests. Pin the target repository and your change-type conventions in `agent/instructions.md`.
