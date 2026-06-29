# Onboarding Tester Agent

A first-time-developer agent that follows your README from a clean checkout and reports the first blocker.

## What it does

Acts like a brand-new contributor who just cloned the repo: it reads your README (and the CONTRIBUTING, getting-started, or setup scripts it points to) and follows the documented steps literally, in order, from a clean checkout. It stops at the first blocker (a missing or out-of-order step, a command that errors, an undocumented prerequisite, a failing setup script), confirms it by retrying from clean, and reports the exact doc or script fix that would unblock a first-time developer. It is read-only: it never edits, commits, or "fixes" the repo.

It uses native sandbox commands to perform the documented setup and drives a real browser (Agent Browser) in the eve sandbox to verify the app loads when the docs claim it should. The capability is the sandbox plus the browser; the LLM does the onboarding judgment.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add onboarding-tester
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required to follow public documentation. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built.

After installing, customize `agent/instructions.md` to tell the agent where this project's onboarding docs live (README, CONTRIBUTING, docs/getting-started, setup scripts).

## Usage

Run the agent on demand against a repo, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent follows the documented setup from a clean checkout, stops at the first blocker with the exact command and output, proposes the corrected doc or script text, retries from clean to confirm reproducibility, and reports whether onboarding completes.

## Connections and auth

This agent has no external service connection and no required environment variables. Setup commands and browser automation run inside the eve sandbox, which is treated as disposable; there is no auth by default.

## Limitations

- The agent depends on sandbox command execution and `agent-browser` being available in the eve sandbox. If either is unavailable, it reports that blocker instead of guessing whether onboarding works.
- It diagnoses onboarding only; it never edits, commits, or pushes changes to the repo.
- Reports and artifacts are session-local; wire them to your own storage if you need long-term history.
- Running setup commands in the sandbox reproduces the experience but does not change your project.
