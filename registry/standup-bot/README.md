# Standup Bot

## What it does

Reads a configured Slack channel and drafts a concise standup digest: a standup draft, priorities, active threads and blockers, wins and shipped work, gaps and follow-up questions, and the source window with caveats. Every item is grounded in observed messages, and a quiet channel gets a minimal digest rather than padding. It only drafts for review and never posts, replies, or reacts in Slack.

## Setup

Create a Slack app whose bot token can read the channel you want summarized, then invite the bot to that channel.
