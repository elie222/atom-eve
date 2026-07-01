# Standup Bot

## What it does

Hands you a ready-to-review daily standup digest drawn from your team's Slack channel. It reads a configured channel and drafts:

- a standup draft and the day's priorities
- active threads and blockers
- wins and shipped work
- gaps and follow-up questions
- the source window with caveats

Every item is grounded in observed messages, and a quiet channel gets a minimal digest rather than padding.

## Setup

Create a Slack app whose bot token can read the channel you want summarized, then invite the bot to that channel.
