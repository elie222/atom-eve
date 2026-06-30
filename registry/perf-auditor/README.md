# Performance Auditor

A browser-driven performance agent that finds the single worst bottleneck per page and proposes one fix.

## What it does

Measures load timings, transfer weight, request count, heaviest resources, and render-blocking assets for configured URLs. It identifies the single worst bottleneck per page and proposes one behavior-preserving fix.

It is read-only: it never edits files, deploys, or changes the site, and every number is grounded in an observed measurement.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add perf-auditor
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages.

After installing, customize `agent/instructions.md` with your pages, performance budgets, and reporting preferences.

## Usage

Run the agent on demand against URLs, or use the bundled weekly schedule (Mondays at 09:00 UTC). It opens each URL, reads real Navigation Timing and Resource Timing values, identifies the worst bottleneck, and proposes one fix such as compressing an image, deferring a script, enabling compression, or code-splitting a bundle.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation uses `agent-browser` in the Eve sandbox, with no paid performance API.

## Limitations

- If browser automation is unavailable or a page blocks it, the agent reports the blocker instead of guessing numbers.
- It proposes one behavior-preserving fix per page; it never edits files or deploys.
- Screenshots and timing artifacts are session-local unless you persist them.
- Timings vary by network and run; confirm regressions across multiple runs.
