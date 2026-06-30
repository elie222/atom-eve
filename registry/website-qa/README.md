# Product QA

## What it does

Opens your web app in a real browser and runs a user flow end to end: signs up with a fresh disposable test account, completes onboarding, and exercises the core flow once. It screenshots each important state and returns a Markdown report with an executive summary, what was checked, findings ordered by severity, the captured artifacts, recommended fixes, and a follow-up test prompt. It fills forms as part of QA but never submits payment or uses real user credentials.

## Setup

Connect Slack so it can post reports, and set the channel it posts to. Tune `agent/instructions.md` with your onboarding flow, acceptance criteria, and test-account policy.
