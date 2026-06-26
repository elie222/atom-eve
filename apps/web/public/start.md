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
   - If neither exists, scaffold one with `npx atom-eve init` (see below).
2. **Find the right agents.** Match the user's goal to agents in the registry
   (see "Browse" below). Prefer agents whose `family`/`category` fit the job.
3. **Install each agent** with `npx atom-eve add <agent>`.
4. **Wire up keys.** After install, copy `.env.example` to `.env` and fill the keys each
   agent declares in its `atom.json` `requiredEnv`. Never invent secret values — ask the user.
5. **Run it.** For eve.dev: `eve dev`. For flue: follow the flue project's run script.

Agents never auto-publish or take destructive actions on their own — they open PRs or post
drafts for review. Keep that behavior intact when wiring them in.

---

## CLI

```bash
# Scaffold a new project (asks for eve or flue, writes atom-eve.json)
npx atom-eve init

# Add an agent from the registry
npx atom-eve add seo-audit

# Pin the target explicitly
npx atom-eve add website-qa --target eve
npx atom-eve add facebook-ads --target flue

# List available agents
npx atom-eve list
```

`init` accepts `--target eve|flue` and `--runtime node|cloudflare|vercel`. If you don't pass
`--target`, the CLI detects it from the project or prompts for it.

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
