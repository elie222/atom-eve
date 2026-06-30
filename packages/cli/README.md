# Atom Eve

**Installable AI agents for [Eve](https://eve.dev) projects.**

Atom Eve is an open-source, shadcn-style registry of real agent source code. Browse an agent on
[atomeve.dev](https://www.atomeve.dev), install it into your own repo with this CLI, add your
credentials, and run it. Atom Eve doesn't host or run your agents or store credentials — it gives you
code you can review, modify, and deploy yourself.

- **Website & catalog:** [atomeve.dev](https://www.atomeve.dev)
- **Source & docs:** [github.com/elie222/atom-eve](https://github.com/elie222/atom-eve)

## Quick start

```bash
# Scaffold a full app (delegates to eve) and install an agent — recommended
npx atom-eve create my-agent --agent website-qa

# Slack is on by default; opt out, or also route the scheduled report to Slack
npx atom-eve create seo --agent seo-audit --no-slack
npx atom-eve add seo-audit --deliver slack

# Monorepo root for running many agents (agents/*)
npx atom-eve init --workspace my-agents

# Install an agent; if package.json is missing, this initializes the project first
npx atom-eve add facebook-ads

# Write atom-eve.json (+ minimal fallback scaffold) into an existing project
npx atom-eve init
```

The CLI resolves the target and copies registry source files into the framework-native project layout. Eve installs write a root agent under `agent/`.

Eve is Vercel-native: run `vercel link` and the AI Gateway authenticates via `VERCEL_OIDC_TOKEN` — no model API key needed. Provider auth is configured per agent: use Vercel Connect or a Vercel integration when available, otherwise set the required project env vars.

A bidirectional Slack channel is added by default on Eve installs (authenticated via Vercel Connect); pass `--no-slack` to opt out. `--deliver slack` additionally rewires simple `markdown` schedules so the scheduled run posts its report to `SLACK_CHANNEL_ID`.

See the [project README](https://github.com/elie222/atom-eve/blob/main/README.md) for the end-to-end flow.
