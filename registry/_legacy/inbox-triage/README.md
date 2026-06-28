# Inbox Triage Agent

## What it does

Reviews the project's Gmail inbox and produces an Inbox Zero style triage. It classifies each message, flags newsletters and automated notifications as noise to label or archive, and drafts replies for the messages that actually need a response.

It is read-only and draft-first: the only custom tool is a small Gmail reader, and every label, archive, and reply comes back as a draft for operator approval. The agent does not modify the inbox or send anything on its own.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add inbox-triage
```

Target overrides:

```bash
npx atom-eve add inbox-triage --target eve
npx atom-eve add inbox-triage --target flue
```

## Setup

Create an OAuth access token for the Gmail API with read access to your messages (for example the `gmail.readonly` scope). The agent reads the token from the environment at runtime.

Required environment variables:

```bash
GMAIL_ACCESS_TOKEN=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to triage the inbox on demand, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (runs at 09:00 daily).
- Flue installs an agent plus `src/workflows/inbox-triage-daily.ts`.

The agent reads the inbox, classifies each message, and returns the noise to label or archive alongside ready-to-send draft replies for the rest. Review the drafts, then apply labels, archive, and send from Gmail yourself, or add your own write tool.

## Connections and auth

This package uses a custom Gmail tool with env-token auth because the Gmail messages endpoint is outside the framework-native toolset. The `GMAIL_ACCESS_TOKEN` is read by the installed project at runtime and sent as a Bearer token.

## Limitations

- The reference implementation is read-only: it lists inbox messages and their metadata and never labels, archives, or sends.
- Classification is a lightweight heuristic (unsubscribe headers and automated senders are treated as noise); always confirm categories before acting.
- Applying labels, archiving, and sending replies are intentionally left to the operator or a write tool you add yourself.
- Always review drafted replies before sending to real recipients.
