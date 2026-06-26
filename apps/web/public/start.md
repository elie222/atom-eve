# Atom Eve — Quick Start

Atom Eve is an open-source registry of installable AI agents for **eve.dev** and **flue** —
like shadcn, but for agents. Each agent is a folder plus an `atom.json` manifest that declares
what it does and which environment keys it needs.

Browse the full catalog at **https://atomeve.dev**.

---

## For AI coding assistants

If a user pasted a prompt like _"Read atomeve.dev/start.md and add agents…"_, do this:

1. **Detect or pick a target.** Atom Eve installs into an `eve.dev` or `flue` project.
   - An `eve.dev` project has an `agent/` directory.
   - A `flue` project has a `flue.config.ts` (or `.js`).
   - If neither exists, scaffold a complete app with `npx atom-eve create <name> --target eve --agent <agent>` (or `--target flue`).
2. **Find the right agents.** Match the user's goal to agents in the registry
   (see "Browse" below). Prefer agents whose `family`/`category` fit the job.
3. **Install each agent.** For a new app, use `npx atom-eve create <name> --target eve --agent <agent>`.
   For an existing Eve or Flue app, use `npx atom-eve add <agent> --target <target>`.
4. **Wire up keys.** Check the agent page or `https://atomeve.dev/index.json` for `requiredEnv`.
   Never invent secret values — ask the user. On Eve, set integration secrets as Vercel project env vars.
5. **Run it.** For eve.dev: link Vercel with `vercel link`, pull env with `vercel env pull`, then run `npx eve dev`.
   For flue: follow the flue project's run script.

Agents never auto-publish or take destructive actions on their own — they open PRs or post
drafts for review. Keep that behavior intact when wiring them in.

---

## CLI

```bash
# Scaffold a new Eve app and install an agent
npx atom-eve create my-agent --target eve --agent website-qa

# Scaffold a new Flue app and install an agent
npx atom-eve create seo-agent --target flue --agent seo-audit

# Add an agent to an existing project
npx atom-eve add website-qa --target eve
npx atom-eve add facebook-ads --target flue

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
