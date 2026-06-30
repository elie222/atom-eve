# Error Triage

## What it does

Reads recent unresolved Sentry issues, event samples, stack traces, tags, affected users, releases, and frequency data. It groups likely shared causes, identifies the most valuable fixes, and returns a debugging report with owners, evidence, reproduction clues, and first investigation steps.

## Setup

Create a Sentry organization token with read access to events, projects, releases, and issue data. Configure the organization, project, environment, release filters, and priority rules in `agent/instructions.md` or the scheduled prompt.
