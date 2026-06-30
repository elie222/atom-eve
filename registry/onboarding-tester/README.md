# Onboarding Tester

A first-time-developer agent that follows your README from a clean checkout and reports the first blocker.

## What it does

Acts like a brand-new contributor: it follows your README and linked onboarding docs or setup scripts literally, from a clean checkout. It stops at the first blocker, confirms it by retrying from clean, and reports the doc or script change that would unblock a first-time developer.

It is read-only: it never edits, commits, or fixes the repo.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add onboarding-tester
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public documentation.

After installing, customize `agent/instructions.md` with the onboarding docs to test, such as `README.md`, `CONTRIBUTING.md`, `docs/getting-started`, or setup scripts.

## Usage

Run the agent on demand against a repo, or use the bundled weekly schedule (Mondays at 09:00 UTC). It reports the exact command and output for the first blocker, proposes corrected doc or script text, retries from clean, and says whether onboarding completes.

## Connections and auth

This agent has no external service connection and no required environment variables. Setup commands and browser checks run in the disposable Eve sandbox, with no auth by default.

## Limitations

- It depends on sandbox command execution and `agent-browser`; if either is unavailable, it reports the blocker.
- It diagnoses onboarding only; it never edits, commits, or pushes changes.
- Reports and artifacts are session-local unless you persist them.
- Running setup commands in the sandbox reproduces the experience but does not change your project.
