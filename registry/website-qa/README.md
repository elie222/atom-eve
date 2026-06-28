# Website QA Agent

A browser-driven QA agent that tests web app flows like a product-minded QA engineer.

## What it does

Tests a website or web app the way a product-minded QA engineer would: it opens the site, follows a real user flow such as signup or onboarding, captures screenshots, and produces a repeatable Markdown report on whether the flow works.

This is not an SEO or static HTML audit agent. It drives a real browser (Agent Browser) in the eve sandbox via the built-in `bash` tool, following the open -> snapshot -> act -> screenshot loop. The capability is the browser; the LLM does the QA judgment.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add website-qa
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public websites. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built. The installer also pulls the published `vercel-labs/agent-browser@agent-browser` skill into Eve's local skills directory.

After installing, customize `agent/instructions.md` with your own onboarding flow, test-credential policy, and acceptance criteria. For private apps, configure your own Agent Browser profile/session outside this package and document that flow in your local copy. Do not commit session state or credentials.

## Usage

This agent is on-demand. Send it a target URL and a goal, for example:

```text
Test https://example.com signup. Do not submit payment, bypass CAPTCHA, or use real credentials. Capture screenshots for each important state and summarize blockers.
```

The agent drives Agent Browser in the sandbox:

```bash
npx agent-browser --session website-qa open https://example.com
npx agent-browser --session website-qa snapshot -i
npx agent-browser --session website-qa screenshot reports/assets/home.png
```

It returns a concise Markdown report in the agent response. Screenshots and reports are session-local artifacts; wire the response to your own Slack, GitHub, database, or storage workflow if you need persisted QA history.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default. For authenticated sites, create a browser session/profile manually outside this package and adapt the instructions to pass the relevant Agent Browser flags.

## Limitations

- Browser automation depends on `agent-browser` being available in the eve sandbox. If it is unavailable, the agent reports the blocker instead of doing a static audit.
- Screenshots and reports are session-local artifacts; wire them to your own storage if you need long-term history.
- Keep site-specific URLs, credentials, and QA policies in your app repo, not in the registry package.
