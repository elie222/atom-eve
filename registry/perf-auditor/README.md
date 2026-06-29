# Performance Auditor Agent

A browser-driven performance agent that finds the single worst bottleneck per page and proposes one fix.

## What it does

Measures load timings (time to first byte, DOMContentLoaded, full load, largest contentful paint) and transfer weight (total bytes, request count, heaviest resources, render-blocking assets) for your configured URLs, identifies the single worst bottleneck per page, and proposes exactly one behavior-preserving fix for it. It is read-only: it never edits files, deploys, or changes the site, and it grounds every number in an observed measurement.

It drives a real browser (Agent Browser) in the eve sandbox via the built-in `bash` tool, reading real Navigation Timing and Resource Timing from the page rather than guessing. The capability is the browser; the LLM does the bottleneck judgment.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add perf-auditor
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built.

After installing, customize `agent/instructions.md` with your real pages, performance budgets, and reporting preferences.

## Usage

Run the agent on demand against a set of URLs, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent opens each URL, reads real load timings and transfer weight from the page, identifies the single worst bottleneck, and proposes one behavior-preserving fix (for example compress an image, defer a non-critical script, enable gzip/brotli, or code-split a bundle).

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default. It does not use any paid performance API.

## Limitations

- Browser automation depends on `agent-browser` being available in the eve sandbox. If it is unavailable or a page blocks automation, the agent reports the blocker instead of guessing the numbers.
- It proposes one behavior-preserving fix per page; it never edits files or deploys.
- Screenshots and timing artifacts are session-local; wire them to your own storage if you need long-term history.
- Timings vary by network and run; treat single-run numbers as directional and confirm regressions across runs.
