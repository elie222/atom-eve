# Using Atom Eve

This is the guide for **using** Atom Eve to stand up an agent project end to end. It is written so a
human or an AI coding agent (Claude Code, Codex, Cursor, etc.) can follow it top to bottom and end up
with a running, deployable agent.

> Setting up the Atom Eve **repository itself** to add or develop agents? That's a different job —
> see [`AGENTS.md`](AGENTS.md). This file is about installing agents into *your own* project.

## What Atom Eve does and does not do

Atom Eve is a source-first registry of installable agents for Eve:

- **[Eve](https://eve.dev)** — Vercel's filesystem-first framework for durable agents. You write
  capabilities under `agent/`; Eve runs the model loop, persists sessions, and serves the agent over
  HTTP and platform channels. Deploys to Vercel.

Atom Eve does **not** host or run your agents, store credentials, or provide a runtime. The
frameworks own scaffolding and deployment; Atom Eve copies real, reviewable **agent source** into a
project. So the flow is always: **scaffold the app → install an agent → connect credentials → run →
deploy.** The `atom-eve create` command chains the first two for you.

For framework-level questions (project shape, channels, deploy), the source of truth is the
framework's own docs: <https://eve.dev/docs>.

## Credentials, the short version

There are two different things people lump together as "env vars":

1. **The model credential.** On **Eve this is handled by Vercel — you do not set a model API key.**
   Eve's default model runs through the Vercel AI Gateway, which authenticates with the project's
   `VERCEL_OIDC_TOKEN`. On a deployed Vercel project that token is injected automatically; locally
   you get it by linking the project (`vercel link`) and running `vercel env pull`. (An
   `AI_GATEWAY_API_KEY` or `ANTHROPIC_API_KEY` is only an escape hatch for running outside Vercel.)
   The Vercel account or team must have AI Gateway access enabled. Set `AGENT_MODEL` if you want to
   use a different model that is available to the project.
2. **Per-agent integration secrets** — e.g. `STRIPE_SECRET_KEY`, `GITHUB_TOKEN`, `POSTHOG_API_KEY`.
   These are real third-party secrets. On Eve they are **Vercel project environment variables** (set
   in the dashboard or with `vercel env add`, pulled locally by `vercel env pull`). Some providers
   (e.g. Slack) can instead be wired through a **Vercel connector** with no token at all.

Each agent's page lists exactly which of these it needs (see [Finding agents](#finding-agents)).

## Prerequisites

- **Node.js 24.x** and a package manager (`pnpm` recommended; `npm` works).
- For Eve: a **Vercel account** and the [Vercel CLI](https://vercel.com/docs/cli) (`npm i -g vercel`)
  so the project can link to Vercel for model access and connectors.

---

## Path A — One Eve agent (start here)

### 1. Create the app and install an agent (one command)

Pick a real agent from the catalog (see [Finding agents](#finding-agents)), then:

```bash
npx atom-eve create my-agent --target eve --agent website-qa
cd my-agent
```

`create` delegates to Eve's own scaffolder (`eve init`) so the project shape and dependencies are
always current, then installs the agent's source over it and writes `atom-eve.json`. You get roughly:

```text
my-agent/
  package.json
  agent/
    agent.ts              # defineAgent({ model, ... })
    instructions.md       # the agent's always-on system prompt (from the registry)
    channels/eve.ts       # built-in HTTP channel
    tools/ | sandbox/ | schedules/   # as the agent needs
```

> Prefer to drive it by hand? Run `npx eve@latest init my-agent`, `cd my-agent`, then
> `npx atom-eve add website-qa`. Same result.

### 2. Connect to Vercel (model access)

```bash
vercel link          # connect this folder to a Vercel project
vercel env pull       # writes VERCEL_OIDC_TOKEN (+ any project env) to .env.local
```

That's the model credential handled — no API key to manage. See
[Credentials, the short version](#credentials-the-short-version).

### 3. Add the agent's integration secrets (only if it needs them)

If the agent lists `requiredEnv`, add those values as Vercel project env vars
(`vercel env add STRIPE_SECRET_KEY`, etc.) and re-run `vercel env pull` to get them locally. For a
provider with a Vercel connector (e.g. Slack), configure the connector in Vercel instead of a token.

### 4. Run it locally

```bash
npx eve dev          # interactive terminal UI; npx eve info shows routes/artifacts
```

Use local Eve dev as the first smoke test. Run the agent once, then fix any missing model,
integration, or sandbox setup before deploying.

### 5. Deploy

Deploy the app folder as a Vercel project (its **Root Directory** = the app folder). The OIDC token
and project env vars are injected automatically in production. Follow <https://eve.dev/docs> for
current deploy details.

After deploy, trigger the production channel you intentionally configured, such as Slack, a
scheduled run, or an app UI/HTTP channel. Then inspect the run in the Vercel dashboard under
**Agent Runs**.

Do not assume a freshly installed Eve agent exposes a public production testing endpoint. If you add
an HTTP channel, configure its auth policy explicitly and test it through that channel's expected
client. If Vercel Deployment Protection or team SSO is enabled, automated HTTP checks need an
approved bypass or access method.

---

## Path B — Many Eve agents (monorepo)

Eve treats `agent/` as **one root agent per deployed app** — channels and schedules are root-only.
To run several standalone agents, each with its own channels, schedules, env, and deploy lifecycle,
use one repo with one Eve app per folder and one Vercel project per app.

```bash
npx atom-eve init --workspace my-agents
cd my-agents
npx atom-eve create website-qa --target eve --agent website-qa
npx atom-eve create seo-audit  --target eve --agent seo-audit
```

This produces:

```text
my-agents/
  package.json            # private workspace root
  pnpm-workspace.yaml     # packages: ["agents/*"]
  agents/
    website-qa/           # standalone Eve app  → Vercel project: website-qa
    seo-audit/            # standalone Eve app  → Vercel project: seo-audit
```

> `atom-eve create` places apps under `agents/` when run from a workspace root. Create one Vercel
> project per `agents/<name>` folder (Root Directory pointed at it). See the "Running Many Eve Agents
> On Vercel" section of the [README](README.md) for more.

---

## Finding agents

Only install agents that actually exist in the registry. Sources:

- **Browse (humans):** <https://atomeve.dev>
- **Machine-readable (agents):** <https://atomeve.dev/index.json> — every agent with its `targets`,
  `requiredEnv`, `connections`, `integrations`, and `category`. Fetch this to choose an agent and to
  know exactly which integration secrets to set.
- **Always-available fallback:** the tracked shadcn registry at
  <https://raw.githubusercontent.com/elie222/atom-eve/main/registry.json>.

If you are an AI agent and unsure whether a name is valid, check one of the above first — do not
invent agent names.

## Verify before you finish

- The framework scaffold succeeded and dependencies installed.
- Typecheck/build passes (`eve build`).
- The project is linked to Vercel (`vercel link`) so the model resolves — or an
  `AI_GATEWAY_API_KEY` is set if running outside Vercel.
- The agent runs locally (`npx eve dev`) and does not error on a
  missing required integration secret — if it does, that env var still needs setting.
- For deployed Eve agents, trigger the configured production channel and inspect the resulting run
  in Vercel **Agent Runs**.

## CLI reference

```bash
# Recommended: scaffold a full app (delegates to eve), optionally install an agent
npx atom-eve create <name> [--target eve] [--agent <agent>]

# Monorepo root for running many agents (agents/*)
npx atom-eve init --workspace [name]

# Install an agent into an already-scaffolded project
npx atom-eve add <agent> [--target eve]

# Write atom-eve.json (+ minimal fallback scaffold) into an existing project
npx atom-eve init [--target eve] [--runtime node|cloudflare|vercel]

npx atom-eve list
```

`atom-eve add` resolves the target and copies registry source files into the framework-native
project layout. It expects `atom-eve.json`'s `registry` value to be a GitHub `owner/repo` for public
registry installs. Local checkout installs also work:

```bash
npx atom-eve add /path/to/atom-eve/registry/website-qa --target eve
```
