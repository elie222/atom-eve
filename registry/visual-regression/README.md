# Visual Regression Agent

A browser-driven agent that snapshots key screens and flags unintended UI diffs against a baseline.

## What it does

Opens your configured key screens in a real browser, captures current screenshots, compares them against a saved baseline, and reports unintended UI differences (layout shifts, missing or clipped elements, color/spacing/typography changes, broken images, overflow) ordered by severity. It is read-only: it never approves, updates, or overwrites baselines, and it never changes the product UI.

It drives a real browser (Agent Browser) in the eve sandbox via the built-in `bash` tool, using deterministic capture settings (fixed viewport, stable waits) so diffs are meaningful. The capability is the browser; the LLM does the diff judgment.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add visual-regression
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public screens. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built.

After installing, customize `agent/instructions.md` with your real screen list and target URLs. Place known-good reference images under `reports/visual-regression/baseline`; the agent treats that directory as a read-only reference.

## Usage

Run the agent on demand against your screens, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent captures current screenshots under `reports/visual-regression/current`, compares them to the baseline, writes diff artifacts under `reports/visual-regression/diffs`, and reports findings ordered by severity. If no baseline exists for a screen, it says it is establishing a baseline rather than flagging a regression.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default. For authenticated screens, create a browser session/profile manually outside this package and adapt the instructions.

## Limitations

- Browser automation depends on `agent-browser` being available in the eve sandbox. If it is unavailable or a blocker appears, the agent reports it instead of substituting a static audit.
- Baseline and current screenshots are session-local unless you persist them yourself; an ephemeral sandbox has no baseline until you provide one.
- The agent never approves, updates, or overwrites baselines, and never changes the UI.
- Distinguishing intentional from unintended changes is a judgment call; review flagged diffs before acting.
