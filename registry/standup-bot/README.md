# Standup Bot

Drafts a daily standup from recent Slack channel activity.

## What it does

Reads a configured Slack channel and drafts a concise standup digest with priorities, active threads, blockers, and wins. It is read-only: the agent returns a draft for review and never posts to Slack.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add standup-bot
```

## Setup

Create a Slack app with a bot token that can read the channel you want summarized, then invite the bot to the channel.

Set:

- `SLACK_BOT_TOKEN` — Slack bot token with `channels:history` for public channels, or `groups:history` for private channels.
- `SLACK_CHANNEL_ID` — the channel ID to summarize.

## Usage

Run it on demand, or use the bundled weekday schedule at 09:00 UTC. By default it reviews the last 24 hours and up to 50 messages.

## Connections and auth

Uses a focused Slack reader tool with env-token auth. It calls Slack `conversations.history` for the configured channel and returns message facts to the model.
