# Accessibility Auditor Agent

A browser-driven accessibility agent that reports WCAG issues by user harm.

## What it does

Audits your configured pages for accessibility issues across keyboard access, screen reader semantics, color contrast, text scaling, and motion or timing problems. It returns a prioritized report with affected elements, WCAG criteria, screenshots for significant issues, and suggested fixes.

It is read-only: it proposes fixes but never edits source, opens pull requests, deploys, or claims remediation.

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

- Pages to audit.
- Accessibility target, usually WCAG 2.2 AA.
- Reporting preferences and known product constraints.

For private apps, configure an Agent Browser session outside this package. Do not commit session state or credentials.

## Usage

Run the agent on demand against URLs, or use the bundled weekly schedule (Mondays at 09:00 UTC). Scheduled reports appear in the Eve run session unless you wire them to another channel or storage system.

## Connections and auth

This agent has no external service connection and no required environment variables. For authenticated pages, provide your own browser session/profile and adapt the local instructions.

## Limitations

- Browser automation depends on `agent-browser` and axe-core in the Eve sandbox; if unavailable, the agent reports the blocker.
- Screenshots and reports are session-local unless you persist them.
- The agent proposes fixes only; it never remediates, edits source, or deploys.
- Keep page URLs, credentials, and audit policies in your app repo, not this registry package.
