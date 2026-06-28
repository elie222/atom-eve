# Accessibility Auditor Agent

A browser-driven accessibility agent that reports WCAG violations grouped by user harm.

## What it does

Crawls your configured key pages, injects and runs axe-core in a real browser, and reports WCAG violations grouped by user harm (keyboard operability, screen reader / semantics, low vision, color contrast, motion / timing) with concrete, read-only proposed fixes. It is strictly read-only: it proposes fixes but never edits source, opens pull requests, deploys, or claims to have remediated anything.

It drives a real browser (Agent Browser) in the eve sandbox via the built-in `bash` tool, following the open -> snapshot -> inject axe-core -> collect violations loop. The capability is the browser plus axe-core; the LLM does the harm-grouping and fix drafting.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add a11y-auditor
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages. The installed sandbox bootstrap prepares Agent Browser, a Chromium runtime, and axe-core inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built.

After installing, edit `agent/instructions.md` with your real pages, target WCAG level, and reporting preferences. For private apps, configure your own Agent Browser profile/session outside this package and document that flow in your local copy. Do not commit session state or credentials.

## Usage

Run the agent on demand against a set of URLs, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent opens each page with Agent Browser, injects axe-core and runs it, captures screenshots of pages with significant violations, groups findings by user harm, and reports the affected selector, WCAG success criterion, and a proposed fix for each.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default. For authenticated pages, create a browser session/profile manually outside this package and adapt the instructions.

## Limitations

- Browser automation depends on `agent-browser` and axe-core being available in the eve sandbox. If they are unavailable, the agent reports the blocker instead of doing a static audit.
- Screenshots and reports are session-local artifacts; wire them to your own storage if you need long-term history.
- The agent proposes fixes only; it never remediates, edits source, or deploys.
- Keep page-specific URLs, credentials, and audit policies in your app repo, not in the registry package.
