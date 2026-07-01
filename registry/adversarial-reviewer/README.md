# Adversarial Reviewer

## What it does

Catches the risks the first review missed on a pull request before you merge.

Reads the PR and its diff, then hunts for:
- correctness bugs
- security holes and data loss
- breaking API or schema changes
- missing tests on risky paths

It separates blocking concerns from nits, grounds every objection in a specific file and hunk, and flags where the change does not match what the PR title or body claims. Give it a PR number, or ask it to triage open PRs.

## Setup

A GitHub token with read access to the target repository's pull requests. Pin the repository and your review checklist in `agent/instructions.md`.
