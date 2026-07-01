# Dependency Guardian

## What it does

Tells you which dependency updates to ship now, which can wait, and which need code changes, with the evidence behind each call.

Each run it:
- reads open Dependabot alerts and dependency update PRs
- inspects manifests, lockfiles, release notes, and advisories for affected packages
- checks whether the vulnerable code is actually reachable in your repo
- returns an upgrade plan: immediate actions, PR triage, alert triage, and a verification plan

Every reachability call is marked confirmed, likely, unlikely, or unknown with its evidence.

## Setup

Create a GitHub token with read access to repository contents, pull requests, Dependabot alerts, and security advisories.

Set the target repository, package ecosystems, runtime entrypoints, and any pinned-version policies in `agent/instructions.md`.
