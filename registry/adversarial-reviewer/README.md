# Adversarial Reviewer

## What it does

Reads a pull request and its diff, then looks for issues a first review may have missed: correctness bugs, security holes, data loss, breaking API or schema changes, and missing tests on risky paths. It separates blocking concerns from nits, grounds every objection in a specific file and hunk, and flags where the change does not match what the PR title or body claims. Give it a PR number, or ask it to triage open PRs.

## Setup

Provide a GitHub token with read access to the repository's pull requests. Pin the target repository and your review checklist in `agent/instructions.md`.
