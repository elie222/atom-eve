# Atom Eve

**Installable AI agents for [Eve](https://eve.dev) and [Flue](https://flueframework.com/) projects.**

Atom Eve is an open-source, shadcn-style registry of real agent source code. Browse an agent on
[atomeve.dev](https://atomeve.dev), install it into your own repo with this CLI, add your
credentials, and run it. Atom Eve doesn't host or run your agents or store credentials — it gives you
code you can review, modify, and deploy yourself.

- **Website & catalog:** [atomeve.dev](https://atomeve.dev)
- **Source & docs:** [github.com/elie222/atom-eve](https://github.com/elie222/atom-eve)

## Quick start

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

The CLI resolves the target and delegates registry installs to shadcn where possible. Eve installs write a root agent under `agent/`.

Eve is Vercel-native: run `vercel link` and the AI Gateway authenticates via `VERCEL_OIDC_TOKEN` — no model API key needed. Per-agent integration secrets (e.g. `STRIPE_SECRET_KEY`) are set as Vercel project env vars. For Flue, set env vars per its docs.

See the [full usage guide](https://github.com/elie222/atom-eve/blob/main/USAGE.md) for the end-to-end flow.
