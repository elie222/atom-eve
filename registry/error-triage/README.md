# Error Triage

## What it does

Turns raw Sentry errors into a prioritized debugging report: what to fix first, why, and where to start.

Each run it:
- reads recent unresolved issues with event samples, stack traces, tags, releases, and frequency data
- groups issues that likely share a root cause
- ranks by user impact, volume, growth, and critical-path tags rather than raw event count
- returns top issue groups with suggested owners, evidence, reproduction clues, and first debugging steps

## Setup

Create a Sentry organization token with read access to events, projects, releases, and issue data.

Set the organization, project, environment, release filters, and priority rules in `agent/instructions.md`.
