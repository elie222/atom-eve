# Visual Regression

A browser-driven agent that snapshots key screens and flags unintended UI diffs against a baseline.

## What it does

Opens configured screens in a real browser, captures current screenshots, compares them against a saved baseline, and reports unintended UI differences such as layout shifts, missing or clipped elements, color/spacing/typography changes, broken images, and overflow.

It is read-only: it never approves, updates, or overwrites baselines, and never changes the product UI.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add visual-regression
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public screens.

After installing, customize `agent/instructions.md` with your screen list and target URLs. Place known-good reference images under `reports/visual-regression/baseline`; the agent treats that directory as read-only.

## Usage

Run the agent on demand against screens, or use the bundled weekly schedule (Mondays at 09:00 UTC). It captures current screenshots under `reports/visual-regression/current`, writes diff artifacts under `reports/visual-regression/diffs`, and reports findings by severity. If no baseline exists, it says it is establishing a baseline.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation uses `agent-browser` in the Eve sandbox. For authenticated screens, provide your own browser session/profile and adapt the local instructions.

## Limitations

- If browser automation is unavailable or blocked, the agent reports the blocker instead of substituting a static audit.
- Baselines and screenshots are session-local unless you persist them; ephemeral sandboxes have no baseline until you provide one.
- The agent never approves, updates, or overwrites baselines, and never changes the UI.
- Review flagged diffs before acting; intentional changes still need human judgment.
