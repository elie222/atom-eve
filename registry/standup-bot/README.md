# Standup Bot Agent

## What it does

Reads recent updates from a configured [Slack](https://slack.com) channel and drafts a daily standup digest grounded in what the team actually posted. The digest is organized into priorities, active threads, and recent wins. It is draft-first: the agent returns an operator-ready digest for review and never posts anything back to Slack on its own.

The only custom tool is a small Slack reader that calls `conversations.history` for the configured channel.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add standup-bot
```

Target overrides:

```bash
npx atom-eve add standup-bot --target eve
npx atom-eve add standup-bot --target flue
```

## Setup

Create a Slack app with a bot token that has the `channels:history` (and `groups:history` for private channels) scope, and invite the bot to the channel you want to summarize. Find the channel ID in Slack under the channel details.

Required environment variables:

```bash
SLACK_BOT_TOKEN=xoxb-...
SLACK_CHANNEL_ID=C0123456789
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to read the channel and draft today's standup, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (cron `0 9 * * *`).
- Flue installs an agent plus `src/workflows/standup-bot-daily.ts`.

The agent reads recent channel history, then drafts a standup digest with priorities, active threads, and wins. Review the draft and share it yourself, or add your own write tool.

## Connections and auth

This package uses a custom Slack tool with env-token auth because the Slack `conversations.history` endpoint is outside the framework-native toolset. The bot token and channel ID are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only and only reads recent channel messages; it does not post messages, reply in threads, or read full thread transcripts.
- Posting the digest, scheduling messages, and reacting are intentionally left to the operator or a write tool you add yourself.
- Always review the drafted digest before sharing it with your team.
