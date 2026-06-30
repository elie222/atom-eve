# Community Support

## What it does

Reads recent messages from a configured Discord support channel and prepares an operator review: open questions, likely answerable items, sensitive or ambiguous threads to escalate, and draft replies grounded in supplied product context. Drafts stay tied to the original message id and author so a human can review and post them.

## Setup

Create a Discord bot with View Channel and Read Message History access, invite it to the support channel, and set the channel it should read. Add product documentation, support boundaries, escalation rules, and tone guidance to `agent/instructions.md`.
