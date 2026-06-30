# Product QA Agent

A browser-driven QA agent that tests web app flows like a product-minded QA engineer.

## What it does

Tests a website or web app by opening the site, following a real user flow such as signup or onboarding, capturing screenshots, and producing a repeatable Markdown QA report.

This is not an SEO or static HTML audit agent. It uses a real browser and is read-only by default.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add website-qa
```

This copies the agent into `agent/` in your eve app and pulls the published `vercel-labs/agent-browser@agent-browser` skill into Eve's local skills directory.

## Setup

No credentials or environment variables are required for public websites.

After installing, customize `agent/instructions.md` with your onboarding flow, test-credential policy, and acceptance criteria. For private apps, configure an Agent Browser profile/session outside this package and document that flow locally. Do not commit session state or credentials.

## Usage

Run it on demand with a target URL and goal:

```text
Test https://example.com signup. Do not submit payment, bypass CAPTCHA, or use real credentials. Capture screenshots for each important state and summarize blockers.
```

The agent returns a concise Markdown report. Screenshots and reports are session-local unless you wire them to Slack, GitHub, a database, or storage.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation uses `agent-browser` in the Eve sandbox. For authenticated sites, provide your own browser session/profile and adapt the local instructions.

## Limitations

- If browser automation is unavailable, the agent reports the blocker instead of doing a static audit.
- Screenshots and reports are session-local unless you persist them.
- Keep site URLs, credentials, and QA policies in your app repo, not this registry package.
