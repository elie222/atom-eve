# Support Replies Agent

## What it does

Reads your project's open [Intercom](https://www.intercom.com) conversations and drafts grounded replies for operator approval, escalating hard cases instead of guessing. It is draft-first: every reply comes back as an operator-ready draft paired with its conversation id and customer, and the agent does not reply to, close, snooze, or otherwise change any conversation on its own.

The only custom tool is a small Intercom conversation reader. For each open conversation it returns the customer, a short preview, and a per-conversation reply plan that marks whether to draft a reply or escalate (for example, conversations flagged priority in Intercom).

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add support-replies
```

Target overrides:

```bash
npx atom-eve add support-replies --target eve
npx atom-eve add support-replies --target flue
```

## Setup

Create an Intercom access token from your Intercom workspace's developer settings with read access to conversations.

Required environment variables:

```bash
INTERCOM_ACCESS_TOKEN=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review open conversations and draft replies, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (runs at `0 9 * * *`).
- Flue installs an agent plus `src/workflows/support-replies-daily.ts`.

The agent reads your open conversations, then drafts a grounded reply for each one and flags any that should be escalated to a human. Review and send approved drafts from Intercom yourself, or add your own write tool.

## Connections and auth

This package uses a custom Intercom tool with env-token auth because the Intercom conversations endpoint is outside the framework-native toolset. The access token is read by the installed project at runtime via `INTERCOM_ACCESS_TOKEN`.

## Limitations

- The reference implementation is read-only and only lists conversations; it does not reply, close, snooze, reassign, or read full conversation-part threads.
- Sending replies, closing conversations, and any other write action are intentionally left to the operator or a write tool you add yourself.
- Reply plans use a simple escalation heuristic (Intercom priority). Always review drafted copy and the conversation context before sending to a real customer.
