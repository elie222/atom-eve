# Error Triage Agent

## What it does

Reviews recent production errors, groups likely regressions, identifies severity and likely owner or file when inferable, and proposes a TDD-style fix plan.

The MVP integration is Sentry. It is read-only and does not mutate issues, assign owners, comment on alerts, or create pull requests.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add error-triage
```

Target overrides:

```bash
npx atom-eve add error-triage --target eve
npx atom-eve add error-triage --target flue
```

## Setup

Create a Sentry auth token with read access for the organization and project you want the agent to inspect.

Required environment variables:

```bash
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...
```

Optional environment variables:

```bash
SENTRY_BASE_URL=https://sentry.io/api/0
ERROR_TRIAGE_LOOKBACK_DAYS=1
ERROR_TRIAGE_ENVIRONMENT=production
ERROR_TRIAGE_HISTORY_DIR=reports/error-triage/history
ERROR_TRIAGE_MAX_ISSUES=25
```

## Usage

Run the agent manually or wire the installed daily schedule/workflow into your deployment. The tool fetches recent unresolved Sentry issues, groups recurring signatures, compares them with prior local history reports, and writes a new JSON report to `reports/error-triage/history`.

History files are intentionally lightweight so the first version works without a database. Keep these reports as build artifacts or persisted volume state if you want the agent to distinguish new from recurring issues across runs. A database-backed history store is a natural next step for multi-project or long-retention deployments.

## Connections and auth

This package uses custom Sentry HTTP API code with env-token auth. It only calls read endpoints for project issues and issue events. Axiom can be added later as a separate read-only integration if the package needs log-based grouping in addition to Sentry issue grouping.

## Limitations

- The reference implementation is read-only and deliberately does not create PRs.
- Owner and file inference depends on stack frames, issue metadata, and Sentry assignment fields being present.
- Severity is heuristic. Review critical findings before paging or prioritizing work.
- Local history comparison only sees reports available on the running filesystem.
