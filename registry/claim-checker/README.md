# Claim Checker Agent

A browser-driven agent that inventories marketing claims and drafts repairs for risky overstatements.

## What it does

Crawls your configured marketing pages, inventories customer-facing claims, checks them against your product sources of truth, and flags risky claims such as unsubstantiated metrics, absolute language, unsupported compliance assertions, and competitor comparisons. It drafts defensible rewrites for high-risk claims.

It is read-only: it never edits, publishes, or ships marketing copy.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add claim-checker
```

This copies the agent into `agent/` in your eve app.

## Setup

No credentials or environment variables are required for public pages.

After installing, customize `agent/instructions.md` with your marketing URLs, product sources of truth, claims policy, and review preferences.

## Usage

Run the agent on demand against marketing pages, or use the bundled weekly schedule (Mondays at 09:00 UTC). It records each claim with exact wording, source URL, claim type, verdict, risk level, and suggested repair.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation uses `agent-browser` in the Eve sandbox. For authenticated pages, provide your own browser session/profile and adapt the local instructions.

## Limitations

- Browser automation depends on `agent-browser`; if unavailable, the agent reports the blocker.
- Verdicts depend on the sources of truth you provide; unverifiable claims are marked unverified.
- Screenshots and reports are session-local unless you persist them.
- Suggested repairs are drafts for human review and application.
