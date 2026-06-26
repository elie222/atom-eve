# Onboarding Tester Agent

## What it does

The Onboarding Tester Agent checks whether a brand-new developer can actually get this project running by following only its documentation. It behaves like a first-time contributor who just cloned the repo: it reads the README and any setup steps the README points to, follows them literally from a clean checkout, and stops at the first thing that blocks a newcomer.

For each run it reports:

- The setup steps it followed, in order, exactly as documented
- The first blocker (missing/out-of-order step, wrong command, undocumented prerequisite or env var, failing script, broken link)
- The exact documentation or script fix that would unblock a first-time developer
- Whether a clean re-run reproduces the same blocker
- Evidence: the commands run, their output, and browser screenshots when the docs claim the app should load

It uses the target framework's native sandbox command execution and native browser capabilities. It does not install or call a custom browser wrapper tool and does not require any paid APIs.

This agent is read-only and draft-first. It diagnoses onboarding and proposes the fix; it never edits, commits, or "fixes" your docs or code for you.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add onboarding-tester --target flue
```

or:

```bash
npx atom-eve add onboarding-tester --target eve
```

## Setup

After install, edit the agent instructions so they point at this project's real onboarding entry points (README, CONTRIBUTING, `docs/getting-started`, or a setup script) and the documented local URL the app should serve.

Tell the agent how to obtain a clean checkout in your environment, for example:

```text
Run the onboarding test for this project.

Clean checkout: git clone https://github.com/acme/example-app && cd example-app
Docs to follow: README.md "Getting started" section
App should load at: http://localhost:3000
```

No API keys are required. If a documented step needs secrets, provide non-production placeholders in the prompt or local config and keep real credentials out of this registry package.

The Eve target includes a sandbox bootstrap that runs `setup-agent-browser.sh`, which installs Agent Browser and a headless Chromium and creates `reports/assets` for screenshots. For Flue, run the same bundled script (or its equivalent) in the sandbox before the first browser command.

## Usage

Run the weekly schedule or ask the agent directly:

```text
Run the onboarding test as a first-time developer.

Clean checkout: git clone https://github.com/acme/example-app && cd example-app
Follow README.md exactly, in order. The app should load at http://localhost:3000.

First run bash setup-agent-browser.sh. Use native sandbox commands to follow the documented
setup, and the native browser to verify the app loads. Stop at the first blocker, confirm it by
retrying from a clean checkout, and report the exact doc/script fix needed. Do not change any
project files.
```

The agent should:

- Use sandbox commands (`git`, `npm`/`pnpm`, build/run steps) to follow the documented setup exactly as written.
- Use the native browser capability to open the documented local URL, snapshot it, and capture a screenshot under `reports/assets/`.
- Stop at the first blocker and quote the README text that diverged from reality.
- Retry from a clean checkout to confirm reproducibility.

Return a concise Markdown report with:

1. Executive summary
2. Setup steps followed
3. First blocker
4. Recommended doc/script fix (read-only)
5. Clean re-run result
6. Evidence and artifacts
7. Remaining risks and follow-up

## Connections and auth

This package has no external service connection and no required environment variables. It relies on the host framework's native browser and sandbox command capabilities.

If a documented setup step needs credentials, wire them into your own project and document the allowed access policy locally rather than committing secrets here.

## Limitations

- The agent follows the documentation it is pointed at; if the README omits a step entirely it can only report the gap, not infer the intended workflow.
- It stops at the first blocker by design, so a single run may not surface every downstream issue. Re-run after each fix.
- Sandboxes are ephemeral, so screenshots and artifacts under `reports/assets/` can be lost between runs. Durable storage and report delivery are future host-app work.
- Browser verification depends on the target framework's native browser capability being available; if it is unavailable the agent reports that blocker instead of guessing.
- The agent is read-only: it proposes doc/script fixes but never edits, commits, or merges anything.
