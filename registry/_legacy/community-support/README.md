# Community Support Agent

## What it does

Reads recent messages in a configured [Discord](https://discord.com) channel, triages the open support questions, and drafts doc-grounded answers for an operator to review and post. It is draft-first: every answer comes back tied to the message it responds to, sensitive or hard questions are flagged for human escalation, and the agent does not post anything to Discord on its own.

The agent uses framework-native agent, schedule, and workflow files. The only custom tool is a small Discord API reader that lists recent channel messages.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add community-support
```

Target overrides:

```bash
npx atom-eve add community-support --target eve
npx atom-eve add community-support --target flue
```

## Setup

Create a Discord application and bot, invite it to your server, and give it read access (View Channel and Read Message History) to the support channel you want the agent to watch. Copy the bot token and the channel ID.

Required environment variables:

```bash
DISCORD_BOT_TOKEN=...
DISCORD_CHANNEL_ID=...
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent messages and draft answers, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts`.
- Flue installs an agent plus `src/workflows/community-support-daily.ts`.

The agent reads the most recent messages from the channel, classifies each as answerable, needs-context, or escalate, and drafts doc-grounded replies for the answerable ones. Review the drafts, then post approved answers from Discord yourself or add your own write tool.

Local smoke test with a mocked Discord response:

```bash
DISCORD_BOT_TOKEN=test DISCORD_CHANNEL_ID=123 pnpm dlx tsx -e '
import { fetchChannelMessages, triageMessages } from "./agent/lib/discord.ts";
const response = { ok: true, json: async () => ([
  { id: "1", author: { id: "u1", username: "ana" }, content: "How do I reset my API key?", timestamp: "2026-06-26T09:00:00.000Z" },
  { id: "2", author: { id: "u2", username: "bo" }, content: "I want a refund, this is urgent", timestamp: "2026-06-26T09:01:00.000Z" }
]) };
const fetchMock = async () => response;
void (async () => {
  const messages = await fetchChannelMessages(25, fetchMock as unknown as typeof fetch);
  console.log(JSON.stringify({ messages, triage: triageMessages(messages) }, null, 2));
})();
'
```

Run the smoke test from an installed Eve project folder after `npx atom-eve add community-support --target eve`. For Flue, change the import path to `./src/lib/agents/community-support/discord.ts`.

## Connections and auth

This package uses a custom Discord tool with env-token auth because the Discord channel-messages call is outside the framework-native toolset. The bot token and channel ID are read by the installed project at runtime, and the bot only needs read scopes.

## Limitations

- The reference implementation is read-only and only lists recent channel messages; it does not post replies, add reactions, or read threads.
- The triage heuristic (question detection plus an escalation keyword list) is intentionally simple; adapt the keywords and rules to your community.
- Answers are only as good as the documentation and context you supply in the prompt; always review drafts and confirm escalations before responding to real members.
