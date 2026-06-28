# Error Copy Agent

A browser-driven agent that finds user-facing error messages and drafts clearer, more empathetic rewrites.

## What it does

Drives your app in a real browser to surface user-facing error messages (form validation errors, HTTP error pages, empty states, permission denials, failed-action toasts), confirms which error states are actually reachable, and drafts clearer, more empathetic before/after rewrites for operator approval. It is read-only and draft-first: it never edits code, copy, or configuration, and it never uses real credentials or bypasses CAPTCHA.

It drives a real browser (Agent Browser) in the eve sandbox via the built-in `bash` tool to navigate the app, trigger error states, and capture screenshots. The capability is the browser; the LLM does the copy judgment.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add error-copy
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public flows. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox on first run, so the first browser run may spend extra time while the sandbox template is built.

After installing, edit `agent/instructions.md` with your real app URLs, flows, brand voice, and copy guidelines. For authenticated flows, configure your own Agent Browser session outside this package and document that flow in your local copy. Do not commit session state or credentials.

## Usage

Run the agent on demand against your app URLs and flows, or let the bundled weekly schedule (Mondays at 09:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the report lands in that run's session. There is no external channel — the report is the session output.

The agent surfaces each error message with its exact current copy, the URL and steps that triggered it, and a screenshot, marks whether the state is reachable or only theoretical, and presents a before/after rewrite with rationale for each.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default. For authenticated apps, create a browser session/profile manually outside this package and adapt the instructions.

## Limitations

- Browser automation depends on `agent-browser` being available in the eve sandbox. If it is unavailable or a flow is blocked, the agent reports the blocker instead of guessing.
- The agent never edits copy, code, or configuration; all rewrites are drafts for operator approval.
- Screenshots and reports are session-local artifacts; wire them to your own storage if you need long-term history.
- Keep app-specific URLs, credentials, and copy guidelines in your app repo, not in the registry package.
