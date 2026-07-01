# Atom Eve

![Atom Eve registry preview](apps/web/public/atom-eve-og.png)

**Installable AI agents for Eve projects.**

Atom Eve is an open-source, shadcn-style registry of real agent source code. Browse an agent, install it into your own repo, add your credentials, and run it on [Eve](https://eve.dev).

```bash
npx atom-eve create my-agent --agent seo-audit
```

The registry is source-first. Atom Eve does not host or run your agents, store credentials, or provide a managed runtime. It gives you code you can review, copy, modify, and deploy yourself.

> Atom Eve is a community project. It is not affiliated with or endorsed by Vercel, Eve, or Cloudflare.

## Get Started With An AI Coding Agent

The fastest way to start — especially if you've never used Eve — is to let your coding
agent set it up. Paste this into **Claude Code**, **Codex**, **Cursor**, or similar:

```text
Set up a new Eve project in this directory using Atom Eve.
Read https://www.atomeve.dev/start.md and follow it.
Start with one agent so we can confirm it builds and runs, then we'll add more.
```

The agent follows [`start.md`](apps/web/public/start.md), scaffolds the project, installs an agent,
and prepares it for verification. Name specific agents (browse [www.atomeve.dev](https://www.atomeve.dev))
if you already know what you want.

## Why This Exists

Skills and prompts are useful, but they usually run only when a human invokes them. Production agents need structure: instructions, tools, skills, schedules, credentials, evals, deployment shape, and framework-specific entrypoints.

Atom Eve packages that structure into installable agent folders:

- **Eve agents** install as root agents under `agent/`.
- Agent instructions, skills, tools, schedules, and library code live in source folders you can review.
- Generated shadcn registry files make installs transparent and inspectable.

## Browse The Registry

The website is the human-facing catalog:

- [www.atomeve.dev](https://www.atomeve.dev)
- [Full generated registry index](https://www.atomeve.dev/index.json)

Each agent page links back to its source folder and renders that agent's README.

## Install An Agent

### Prerequisites

- Node.js with `npx` available.
- For Eve installs: a Vercel account and the [Vercel CLI](https://vercel.com/docs/cli)
  (`npm i -g vercel`) for model access, deployment, and connectors.

Scaffold a full app and install an agent in one step (`create` delegates to the framework's own
scaffolder, then installs the agent's source):

```bash
npx atom-eve create my-agent --agent seo-audit
cd my-agent
```

On Eve this is **Vercel-native**: run `vercel link` and the model resolves through the Vercel AI
Gateway via `VERCEL_OIDC_TOKEN` — no model API key to set. For provider auth, use the agent's
documented setup: supported services may connect through Vercel Connect or a Vercel integration,
while others use project env vars.

```bash
vercel link
vercel env pull
```

The Vercel account or team must have AI Gateway access enabled. `AGENT_MODEL` only changes an Eve
agent's model when the installed agent has an `agent/agent.ts` that reads it. To force a non-default
model, add or update `agent/agent.ts` with `defineAgent({ model: process.env.AGENT_MODEL ?? "..." })`,
then set `AGENT_MODEL` to a provider/model available to the linked Vercel project. If the agent uses
a Vercel connector or integration for a provider such as Stripe or Slack, connect it in Vercel. If it
lists `requiredEnv` for a provider without a connector, add those values as Vercel project env vars
and re-run `vercel env pull`.

Adding an agent to an existing project instead:

```bash
npx atom-eve add seo-audit
```

If the current directory does not have a `package.json` yet, `add` initializes the Atom Eve project
files first and then installs the agent.

A Slack channel is on by default for Eve installs: every agent ships a bidirectional Slack channel, so you can mention the agent and it can reply. Slack auth is brokered by Vercel Connect, so connect a Slack connector in your Vercel project (the agent never sees a token). Opt out with `--no-slack`:

```bash
npx atom-eve add seo-audit --no-slack
```

To also post a scheduled report to Slack automatically, add `--deliver slack`. It rewires the agent's markdown schedule to post to `SLACK_CHANNEL_ID`, so set that variable too:

```bash
npx atom-eve add seo-audit --deliver slack
```

Running many agents from one repo? Scaffold a workspace root and create one app per agent:

```bash
npx atom-eve init --workspace my-agents
cd my-agents
npx atom-eve create seo --agent seo-audit
```

![Atom Eve install flow](apps/web/public/atom-eve-install.png)

The CLI writes `atom-eve.json` to remember project defaults. Pass `--target flue` when you want the
Flue version.

### Verify And Deploy

Install dependencies and run the project checks before deploying changes:

```bash
pnpm install
pnpm typecheck
pnpm build
```

When you are ready to spend model tokens to verify the installed agent, use local Eve dev as the
first smoke test:

```bash
npx eve dev
```

After deploy, trigger the production channel you intentionally configured, such as Slack, a
scheduled run, or an app UI/HTTP channel. Then inspect the run in the Vercel dashboard under
**Agent Runs**.

### Local Checkout Fallback

If you are developing the registry locally or need to bypass the public GitHub source, install from a checkout path:

```bash
npx atom-eve add /path/to/atom-eve/registry/seo-audit
```

This uses the same install map as public registry installs, but reads the source files directly from disk.

## Eve Is New

The framework is early and moving quickly.

- [Eve](https://eve.dev) is Vercel's agent framework. Eve projects have an `agent/` authored surface with slots for instructions, tools, skills, connections, schedules, and subagents.

Expect some framework APIs and conventions to change. This repo keeps fixture installs and typechecks in CI so generated agents stay honest as the ecosystem moves.

### Running Many Eve Agents On Vercel

Today Eve treats `agent/` as one root agent per deployed app. Subagents are useful for delegation, but they are not independent deployed agents: channels and schedules are root-only. If you want many standalone Eve agents with their own Slack connectors, cron jobs, env vars, logs, and deployment lifecycle, use one repository with one Eve project folder per agent and one Vercel project per agent.

Recommended shape:

```text
my-agents/
  agents/
    website-qa/          # Vercel project: website-qa
      agent/
      package.json
    seo/                 # Vercel project: seo
      agent/
      package.json
    youtube-analytics/   # Vercel project: youtube-analytics
      agent/
      package.json
```

Install Atom Eve packages into the app folder for the agent you are deploying. This keeps each production agent isolated while still letting your team manage a private agent catalog in one GitHub repo.

## Add Your Own Agent

Create a folder under `registry/`:

```text
registry/my-agent/
  atom.json
  README.md
  agent/
    instructions.md
    agent.ts            # optional
    tools/
    channels/
    sandbox/
    schedules/
    skills/
    connections/
    lib/
    evals/
```

Minimum requirements:

- Globally unique `name` in `atom.json`.
- An `eve` target.
- Runtime prompt at `agent/instructions.md`.
- README with setup and usage instructions.
- Real source code, not placeholder logic.
- No secrets committed to the repo.
- `pnpm check` passes.

The generator validates manifests, taxonomy, required README sections, generated registry files, and fixture installs.

`atom.json` is intentionally small. Runtime behavior belongs in files:

```json
{
  "$schema": "https://atomeve.dev/schema/atom.json",
  "name": "seo-audit",
  "title": "SEO Audit",
  "description": "Get a prioritized, fix-it-today report of the SEO and content problems on your site.",
  "category": "seo",
  "family": "growth",
  "targets": ["eve"],
  "integrations": ["agent-browser"],
  "connections": [],
  "requiredEnv": [],
  "skills": [{ "ref": "vercel-labs/agent-browser@agent-browser" }]
}
```

Runtime behavior belongs in `agent/`, which is copied verbatim on install:

- `agent/instructions.md` is the installed system prompt.
- `agent/agent.ts` optionally pins a non-default model.
- `agent/tools/*`, `agent/connections/*`, `agent/skills/*`, and `agent/lib/*` provide capabilities.
- `agent/schedules/*` defines Eve schedules.

For example, cron timing belongs in `agent/schedules/weekly.ts`, not in `atom.json`.

## Repository Layout

```text
apps/
  web/                    # Static generated catalog
packages/
  cli/                    # atom-eve CLI
  registry-generator/     # atom.json -> shadcn registry + site index
  schemas/                # Shared schemas
registry/
  seo-audit/              # Reference agent package
fixtures/
  eve/                    # Minimal install/typecheck fixture
registry.json            # Ignored generated path-only shadcn registry index
public/
  r/                      # Ignored generated shadcn registry item payloads
  index.json              # Ignored generated website/catalog index
```

## Development

```bash
pnpm install
pnpm generate
pnpm typecheck
pnpm build
pnpm verify:fixtures
pnpm check
```

`pnpm check` runs generation, package typechecks, builds, fixture installs/typechecks, and a basic secret scan.

## License

MIT
