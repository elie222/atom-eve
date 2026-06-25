# Atom Eve

Open-source, shadcn-style registry of installable AI agents for Eve and Flue projects.

```bash
npx atomeve add facebook-ads
```

This repository contains the registry source, generated shadcn registry files, the `atomeve` CLI, schemas, fixtures, and the static atomeve.dev catalog.

Atom Eve is a community project. It is not affiliated with or endorsed by Vercel, Eve, Cloudflare, or Flue.

## Development

```bash
pnpm install
pnpm generate
pnpm typecheck
pnpm build
```

Generated registry files are committed under `public/r/*`, `public/index.json`, and `registry.json`.
