# atom-eve

CLI for installing Atom Eve agents into Eve and Flue projects.

```bash
# Scaffold a full app (delegates to eve/flue) and install an agent — recommended
npx atom-eve create my-agent --target eve --agent website-qa

# Monorepo root for running many agents (agents/*)
npx atom-eve init --workspace my-agents

# Install an agent into an already-scaffolded project
npx atom-eve add facebook-ads --target eve
npx atom-eve add facebook-ads --target flue --runtime cloudflare

# Write atom-eve.json (+ minimal fallback scaffold) into an existing project
npx atom-eve init --target eve
```

The CLI resolves the target and copies registry source files into the framework-native project layout. Eve installs write a root agent under `agent/`.

Eve is Vercel-native: run `vercel link` and the AI Gateway authenticates via `VERCEL_OIDC_TOKEN` — no model API key needed. Per-agent integration secrets (e.g. `STRIPE_SECRET_KEY`) are set as Vercel project env vars. For Flue, set env vars per its docs.

See [USAGE.md](../../USAGE.md) for the full end-to-end guide.
