# Error Copy

A browser-driven agent that finds user-facing error messages and drafts clearer rewrites.

## What it does

Drives your app in a real browser to surface form validation errors, HTTP error pages, empty states, permission denials, and failed-action toasts. It records reachable error states with current copy, URL, trigger steps, screenshots, and before/after rewrite drafts.

It is read-only and draft-first: it never edits code, copy, or configuration, and never uses real credentials or bypasses CAPTCHA.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add error-copy
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public flows.

After installing, customize `agent/instructions.md` with app URLs, flows, brand voice, and copy guidelines. For authenticated flows, configure an Agent Browser session outside this package and document that flow locally. Do not commit session state or credentials.

## Usage

Run the agent on demand against app URLs and flows, or use the bundled weekly schedule (Mondays at 09:00 UTC). It reports each error state, whether it was reachable, and a rewrite with rationale.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation uses `agent-browser` in the Eve sandbox. For authenticated apps, provide your own browser session/profile and adapt the local instructions.

## Limitations

- If browser automation is unavailable or a flow is blocked, the agent reports the blocker instead of guessing.
- It never edits copy, code, or configuration; all rewrites are drafts for operator approval.
- Screenshots and reports are session-local unless you persist them.
- Keep app URLs, credentials, and copy guidelines in your app repo, not this registry package.
