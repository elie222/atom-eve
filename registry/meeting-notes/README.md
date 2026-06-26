# Meeting Notes Agent

## What it does

Reads a [Fireflies](https://fireflies.ai) meeting transcript and turns it into structured, operator-ready notes: a concise summary, the key decisions, and assigned action items. It then proposes follow-ups (recap emails, task drafts, channel notifications) for you to approve.

It is draft-first and read-only: the custom tool only reads transcript and Fireflies summary data, and the agent does not send emails, create tasks, post to Slack, or route any follow-up on its own. This is an on-demand agent with no schedule or workflow — run it whenever you want a meeting written up.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add meeting-notes
```

Target overrides:

```bash
npx atom-eve add meeting-notes --target eve
npx atom-eve add meeting-notes --target flue
```

## Setup

Create a Fireflies API key from your Fireflies workspace settings (Integrations > Fireflies API) with read access to your transcripts.

Required environment variables:

```bash
FIREFLIES_API_KEY=...
```

Configure this variable in your local shell and in any deployment environment that runs the agent.

## Usage

Run the agent on demand and ask it to summarize a meeting. By default the `review_transcript` tool reads your most recent transcript; pass a `transcriptId` to review a specific meeting.

- Eve installs as the root agent under `agent/`, including the `review_transcript` tool under `agent/tools/`.
- Flue installs an agent under `src/agents/meeting-notes.ts` with the tool under `src/tools/meeting-notes/`.

The agent reads the transcript, then drafts the summary, decisions, action items, and suggested follow-ups. Send approved recaps and create tasks yourself, or add your own write tool.

## Connections and auth

This package uses a custom Fireflies tool with env-token auth because the Fireflies transcript data lives behind its GraphQL API, outside the framework-native toolset. The tool POSTs to `https://api.fireflies.ai/graphql` with a Bearer token read from `FIREFLIES_API_KEY` at runtime.

## Limitations

- The reference implementation is read-only: it reads transcript metadata and the Fireflies-generated summary, and does not send recaps, create tasks, or post messages.
- Routing follow-ups (email, tasks, Slack) is intentionally left to the operator or a write tool you add yourself.
- Summary quality depends on Fireflies' own transcription and summarization for the meeting.
- Always review drafted notes, decisions, and action items before sharing them.
