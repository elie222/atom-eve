# Onboarding Tester

## What it does

Acts like a brand-new contributor with no tribal knowledge: it follows your README and the docs it points to (CONTRIBUTING, docs/getting-started, setup scripts) literally and in order, from a clean checkout. It runs the documented setup in a disposable sandbox (install, copy example env, build, start) and opens the documented local URL in a real browser to confirm the app loads. It stops at the first blocker, captures the exact command and output where the docs diverged from reality, then retries from clean to confirm the blocker reproduces. You get a Markdown report with the first blocker, a quoted-text fix for the doc or script, the clean re-run result, and the evidence behind each claim.

## Setup

Customize `agent/instructions.md` with the onboarding docs to test for your project.
