# UX Reviewer

A read-only UX agent that walks a real user task in the browser and scores each screen.

## What it does

Walks a real user task end to end in the browser, scores each screen for clarity, effort, error prevention, and confidence, then recommends improvements for the weakest spots. It captures screenshots for the screens it reviews.

It is read-only: it observes and recommends, but never changes, fixes, deploys, or submits anything for real.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add ux-reviewer
```

This copies the agent into `agent/` in your eve app.

## Setup

No API keys or environment variables are required for public flows.

Customize `agent/instructions.md` with your product, primary user tasks, design heuristics, and reporting preferences. Configure the task and starting URL in the prompt, or keep them in local notes and reference those notes. For authenticated apps, configure access in your own project and keep credentials out of this registry package.

## Usage

Ask the agent directly, or use the bundled weekly schedule (Mondays at 09:00 UTC). Example:

```text
Review the user task: a first-time visitor signs up and reaches the first onboarding screen at https://app.example/.

Do not submit payment, bypass CAPTCHA, or use real credentials. Walk the natural path screen by screen, capture a screenshot per screen under reports/ux-reviewer/assets/, score each screen, and recommend read-only improvements for the weakest spots.
```

Scheduled reviews appear in the Eve run session unless you wire them to Slack, GitHub, a database, or storage.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation uses `agent-browser` in the Eve sandbox. For authenticated apps, provide your own browser session/profile and adapt the local instructions. Do not commit session state or credentials.

## Limitations

- If browser automation is unavailable, the agent reports the blocker instead of doing a static audit.
- Scores are heuristic judgments grounded in observed screens, not quantitative analytics.
- The agent never implements, deploys, or submits anything.
- Screenshots and reports are session-local unless you persist them.
- Keep app URLs, credentials, and task definitions in your app repo, not this registry package.
