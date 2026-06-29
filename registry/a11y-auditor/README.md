# Accessibility Auditor Agent

A browser-driven accessibility agent that reports WCAG violations grouped by user harm.

## What it does

Audits your configured key pages for accessibility issues and returns a prioritized report grouped by user harm, such as keyboard access, screen reader semantics, color contrast, text scaling, and motion or timing problems.

It is read-only. It proposes fixes but never edits source, opens pull requests, deploys, or claims to have remediated anything.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add a11y-auditor
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages.

After installing, customize `agent/instructions.md` with:

- The pages to audit.
- The accessibility target. Use WCAG 2.2 AA unless your team needs a different standard.
- Reporting preferences and any known product constraints.

For private apps, configure your own Agent Browser session outside this package. Do not commit session state or credentials.

## Usage

Run the agent on demand against a set of URLs, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent opens each page in a browser, runs accessibility checks, captures screenshots for significant violations, and reports affected elements, WCAG criteria, and proposed fixes.

## Connections and auth

This agent has no external service connection and no required environment variables. For authenticated pages, create a browser session/profile manually outside this package and adapt the instructions.

## Limitations

- Browser automation depends on `agent-browser` and axe-core being available in the eve sandbox. If they are unavailable, the agent reports the blocker instead of doing a static audit.
- Screenshots and reports are session-local artifacts; wire them to your own storage if you need long-term history.
- The agent proposes fixes only; it never remediates, edits source, or deploys.
- Keep page-specific URLs, credentials, and audit policies in your app repo, not in the registry package.
