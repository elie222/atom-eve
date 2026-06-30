---
name: create-atom-eve-agent
description: Use when setting up or installing an Atom Eve AI agent in a project, including scaffolding a new eve.dev (Eve) or Flue app, adding an agent with the atom-eve CLI, wiring credentials, and verifying it runs. Triggers include "set up an Atom Eve agent", "install the SEO/ads/QA agent", "add an agent to this project".
---

# Create an Atom Eve agent

Atom Eve installs real agent source into the user's own repo, like shadcn but for
agents. It does not host agents or store credentials. Pick the agent first with
find-atom-eve-agent. For the always-current version of these steps, fetch
https://www.atomeve.dev/start.md.

## Install

Eve is the default target. Use Flue only if the user asks or the project already uses
`@flue/runtime` (an Eve project has an `agent/` directory).

- New project: `npx atom-eve create <name> --agent <agent>`, then `cd <name>`
- Existing Eve project: `npx atom-eve add <agent>`
- Flue: `npx atom-eve add <agent> --target flue`
- Slack: a two-way Slack channel is on by default (pass `--no-slack` to opt out); add
  `--deliver slack` to also post a scheduled run's report to Slack

## Wire credentials

Read the agent's requiredEnv and connections from https://www.atomeve.dev/index.json or
its agent page. Never invent secret values, ask the user. On Eve, prefer a Vercel Connect
connector or Vercel integration when supported, otherwise set Vercel project env vars. On
Flue, use the project's runtime secrets.

## Runtime config (Eve)

Model calls route through the Vercel AI Gateway, so there is no model API key to set, but
the Vercel account or team must have Gateway access. Run `vercel link`, then
`vercel env pull`. Set `AGENT_MODEL` only to choose a different available model.

## Verify

Run `pnpm install`, `pnpm typecheck`, `pnpm build`. For a real smoke test that spends
tokens, run `npx eve dev`.

Atom Eve agents open PRs or post drafts for review. They do not auto-publish or take
destructive actions. If required setup is missing, stop and say exactly what to configure.
