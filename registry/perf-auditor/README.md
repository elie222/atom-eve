# Performance Auditor Agent

## What it does

The Performance Auditor Agent is a weekly, browser-driven performance monitor for teams that want a repeatable read on how fast their pages load without paying for a performance-monitoring API.

For each configured URL it:

- Measures load performance: time to first byte, DOMContentLoaded, full load, and largest contentful paint where observable.
- Measures transfer weight: total bytes, request count, the heaviest resources, and render-blocking scripts or stylesheets.
- Identifies the single worst bottleneck for the page.
- Proposes exactly one behavior-preserving fix for that bottleneck.
- Captures screenshots and raw timing artifacts and compares against prior runs.

The MVP uses the target framework's native browser and sandbox command capabilities (via `agent-browser`). It does not install or call a custom wrapper tool and does not rely on paid performance APIs. The agent is read-only: it never edits, deploys, or changes the site, and it never claims to.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add perf-auditor --target flue
```

or:

```bash
npx atom-eve add perf-auditor --target eve
```

## Setup

Configure the URLs to audit in the prompt you send to the agent, or keep them in your app's local env/config notes and reference those notes from the prompt. For example:

```text
Run the weekly performance audit for:
- Marketing home: https://acme.example/
- Pricing: https://acme.example/pricing
```

No API keys are required.

The Eve target includes a sandbox bootstrap (`setup-agent-browser.sh`) that installs `agent-browser` and Chromium and creates:

```text
reports/perf-auditor/history
reports/perf-auditor/artifacts
```

For Flue, the agent runs the same `setup-agent-browser.sh` / `npx agent-browser` flow with the native sandbox command capability and creates the equivalent directories on first run.

## Usage

Run the weekly schedule or ask the agent directly:

```text
Run the weekly performance audit.

URLs:
- https://acme.example/
- https://acme.example/pricing

Measure load timings and transfer weight, identify the single worst bottleneck per page, and propose one behavior-preserving fix for it. Compare against reports/perf-auditor/history if any prior runs exist, capture screenshots, and write a new Markdown report plus a compact JSON snapshot.
```

The agent should use native capabilities available in the host framework:

- Run `bash setup-agent-browser.sh` before the first browser command in a fresh sandbox.
- Drive `npx agent-browser` to open each page and read the Navigation Timing and Resource Timing APIs for real numbers.
- Optionally use sandbox commands such as `curl -w` or `node -e` to confirm transfer sizes and time-to-first-byte.
- Store screenshots and raw artifacts under `reports/perf-auditor/artifacts/<run-id>/`.
- Store the report and compact snapshot under `reports/perf-auditor/history/<run-id>/`.

Return a concise Markdown report with:

1. Executive summary
2. What was measured (URLs and method)
3. Performance metrics (load timings and transfer weight)
4. Worst bottleneck (the single biggest issue per page)
5. Proposed fix (one behavior-preserving change for the bottleneck)
6. Screenshots and artifacts
7. Notable deltas from prior runs and follow-up actions

## Connections and auth

This package has no external service connection and no required environment variables.

You provide the URLs to audit in the prompt or in local env/config notes. For authenticated pages, wire access in your application and document the allowed access policy locally.

## Limitations

- The MVP only compares against files available in `reports/perf-auditor/history/...`.
- Local history can be lost when sandboxes are ephemeral. DB-backed history, object storage for screenshots, and Slack or email delivery are future work.
- Measurements come from a single sandbox run and reflect that environment's network and hardware; they are directional, not lab-grade field data.
- Browser-based timing and screenshots depend on the target framework's native browser capability being available. If automation is blocked, the agent reports the blocker rather than guessing.
- The agent is read-only. It proposes a behavior-preserving fix but never applies, commits, or deploys any change.
