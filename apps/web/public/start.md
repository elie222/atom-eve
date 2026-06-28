# Atom Eve — Quick Start

Atom Eve is an open-source registry of installable AI agents for **eve.dev** —
like shadcn, but for agents. Each agent is a folder plus an `atom.json` manifest that declares
what it does and which environment keys it needs.

Browse the full catalog at **https://atomeve.dev**.

---

## For AI coding assistants

If a user pasted a prompt like _"Read atomeve.dev/start.md and add agents…"_, do this:

1. **Detect or scaffold the project.** Atom Eve installs into an `eve.dev` project.
   - An `eve.dev` project has an `agent/` directory.
   - If none exists, scaffold a complete app with `npx atom-eve create <name> --target eve --agent <agent>`.
2. **Find the right agents.** Match the user's goal to agents in the registry
   (see "Browse" below). Prefer agents whose `family`/`category` fit the job.
3. **Install each agent.** For a new app, use `npx atom-eve create <name> --target eve --agent <agent>`.
   For an existing Eve app, use `npx atom-eve add <agent>`.
4. **Wire up keys.** Check the agent page or `https://atomeve.dev/index.json` for `requiredEnv`.
   Never invent secret values — ask the user. On Eve, set integration secrets as Vercel project env vars.
5. **Run it.** For eve.dev: link Vercel with `vercel link`, pull env with `vercel env pull`, then run `npx eve dev`.

For Eve, model calls go through the Vercel AI Gateway. The user does not need a model API key, but
their Vercel account/team must have any required AI Gateway billing or account verification complete.
If the first run fails with an AI Gateway/provider error, report it as model setup friction and ask
the user to verify billing/access or set `AGENT_MODEL` to a model their project can use.

Agents never auto-publish or take destructive actions on their own — they open PRs or post
drafts for review. Keep that behavior intact when wiring them in.

---

## CLI

```bash
# Scaffold a new Eve app and install an agent
npx atom-eve create my-agent --target eve --agent website-qa

# Add an agent to an existing project
npx atom-eve add website-qa --target eve

# List available agents
npx atom-eve list
```

`create` delegates to the framework scaffolder, installs the selected agent, and writes `atom-eve.json`.
`init` still exists for advanced/manual setups, but `create` is the first-time happy path.

---

## Browse

The registry is grouped into families:

- **engineering** — code review, QA, docs, observability, migrations
- **growth** — SEO, ads, content, social, CRO
- **revenue** — outreach, CRM, sales, finance
- **support** — ticket triage, onboarding, community
- **ops** — productivity, spend, HR, scheduling
- **data** — analytics, research

Open any agent's page at `https://atomeve.dev/agents/<name>/` to see its description,
required keys, integrations, and install command.

---

## Publish your own

Every agent is a folder + an `atom.json` manifest. Fork the template, open a PR, and it's
auto-listed on merge. See the repo: **https://github.com/atomeve**.
