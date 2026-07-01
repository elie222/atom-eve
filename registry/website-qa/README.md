# Product QA

## What it does

Catches broken signup, onboarding, and core flows before your users do. It opens your web app in a real browser and runs the flow end to end:

- signs up with a fresh disposable test account
- completes onboarding
- exercises the core flow once
- screenshots each important state

You get a Markdown report with an executive summary, what was checked, findings ordered by severity, the captured artifacts, recommended fixes, and a follow-up test prompt, posted to Slack. It fills forms as part of QA but never submits payment or uses real user credentials.

## Setup

Connect Slack in Vercel so it can post reports, and set the channel it posts to. Set your onboarding flow, acceptance criteria, and test-account policy in `agent/instructions.md`.
