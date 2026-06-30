---
name: find-atom-eve-agent
description: Use when someone wants to find, browse, compare, or choose an Atom Eve AI agent for a task (SEO, ads, content, QA, analytics, research, CRO, support, finance, ops). Searches the Atom Eve registry and recommends the best-matching installable agent.
---

# Find an Atom Eve agent

Atom Eve is an open registry of installable AI agents for eve.dev and Flue projects,
like shadcn but for agents. This skill is discovery only: match a goal to the right
agent and report what it needs. To scaffold and install one, use create-atom-eve-agent.

## Find the match

Fetch the machine-readable catalog: https://www.atomeve.dev/index.json. Each entry has
a name, description, family, category, integrations, connections, and requiredEnv.
Match the user's goal to a family, then narrow by description:

- engineering: code review, QA, docs, observability, migrations
- growth: SEO, ads, content, social, CRO
- revenue: outreach, CRM, sales, finance
- support: ticket triage, onboarding, community
- ops: productivity, spend, HR, scheduling
- data: analytics, research

Human catalog: https://www.atomeve.dev. Agent page: https://www.atomeve.dev/agents/<name>/.
CLI listing: `npx atom-eve list`.

## Report back

For the best one to three matches, give the agent name, the outcome it delivers in one
line, its requiredEnv and integrations, and the install command `npx atom-eve add <name>`.
If nothing fits, say so and link https://www.atomeve.dev rather than forcing a match.
