# Onboarding Tester

## What it does

Tells you whether a brand-new developer can get your project running from the docs alone. Acting like a first-time contributor with no tribal knowledge, it:

- follows your README and the docs it points to (CONTRIBUTING, getting-started, setup scripts) literally and in order, from a clean checkout
- runs the documented setup in a disposable sandbox: install, copy example env, build, start
- opens the documented local URL in a real browser to confirm the app loads
- stops at the first blocker, then retries from clean to confirm it reproduces

You get a Markdown report with the first blocker, a quoted-text fix for the doc or script, the clean re-run result, and the evidence behind each claim.

## Setup

Point `agent/instructions.md` at the onboarding docs to test for your project.
