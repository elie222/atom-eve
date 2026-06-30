# Dependency Guardian

## What it does

Reads Dependabot alerts, dependency update pull requests, package manifests, lockfiles, release notes, and code references. It separates urgent reachable vulnerabilities from routine version churn, then returns an upgrade plan with risk, owner-ready rationale, verification steps, and PRs that can be merged, deferred, or split.

## Setup

Create a GitHub token with read access to repository contents, pull requests, Dependabot alerts, and security advisories. Configure the target repository, package ecosystems, runtime entrypoints, and any pinned-version policies in `agent/instructions.md` or the scheduled prompt.
