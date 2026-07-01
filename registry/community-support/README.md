# Community Support

## What it does

Turns recent Discord support activity into ready-to-post draft replies and clear escalations for a human.

Reads recent messages from your support channel and prepares an operator review:
- open questions and the ones it can answer
- draft replies grounded in your product context
- sensitive or ambiguous threads flagged for escalation

Each draft stays tied to the original message id and author so a human can review and post it.

## Setup

A Discord bot with View Channel and Read Message History access, invited to the support channel you want it to read. Add your product documentation, support boundaries, escalation rules, and tone guidance to `agent/instructions.md`.
