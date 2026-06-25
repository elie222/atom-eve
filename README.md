# Atom Eve

**Installable AI agents for Eve and Flue projects.**

Atom Eve is an open-source, shadcn-style registry of real agent source code. Browse an agent, install it into your own repo, add your credentials, and run it on [Eve](https://eve.dev) or [Flue](https://flueframework.com/).

```bash
npx atom-eve add facebook-ads
```

The registry is source-first. Atom Eve does not host or run your agents, store credentials, or provide a managed runtime. It gives you code you can review, copy, modify, and deploy yourself.

> Atom Eve is a community project. It is not affiliated with or endorsed by Vercel, Eve, Cloudflare, or Flue.

## Why This Exists

Skills and prompts are useful, but they usually run only when a human invokes them. Production agents need structure: instructions, tools, skills, schedules, credentials, evals, deployment shape, and framework-specific entrypoints.

Atom Eve packages that structure into installable agent folders:

- **Eve agents** install as namespaced child agents.
- **Flue agents** install into the native Flue source layout.
- Shared instructions, skills, and library code live once in this repo.
- Generated shadcn registry files make installs transparent and inspectable.

## Browse The Registry

The website is the human-facing catalog:

- [atomeve.dev](https://atomeve.dev)
- [Full generated registry index](https://atomeve.dev/index.json)

Each agent page links back to its source folder and renders that agent's README.

## Install An Agent

Initialize Atom Eve in your project:

```bash
npx atom-eve init
```

Then add an agent:

```bash
npx atom-eve add facebook-ads
```

Choose a target explicitly when needed:

```bash
npx atom-eve add facebook-ads --target eve
npx atom-eve add facebook-ads --target flue
```

For Flue deployment context:

```bash
npx atom-eve add facebook-ads --target flue --runtime cloudflare
npx atom-eve add facebook-ads --target flue --runtime node
```

The CLI writes `atom-eve.json` to remember project defaults. When it can safely detect your framework, it uses that. When it cannot, it asks for `--target eve` or `--target flue`.

### Manual Shadcn Fallback

Atom Eve stays compatible with shadcn registry installs. The CLI mostly resolves the target and calls shadcn for you.

```bash
npx shadcn@latest add elie222/atom-eve/eve/facebook-ads
npx shadcn@latest add elie222/atom-eve/flue/facebook-ads
```

Use the raw shadcn command when debugging registry output or when you want to bypass the Atom Eve resolver.

## Eve And Flue Are New

Both frameworks are early and moving quickly.

- [Eve](https://eve.dev) is Vercel's agent framework. Eve projects have an `agent/` authored surface with slots for instructions, tools, skills, connections, schedules, and subagents.
- [Flue](https://flueframework.com/) is a TypeScript framework for durable agents and workflows. Flue can target Node.js and Cloudflare, but most Atom Eve Flue packages install as one framework target named `flue`; runtime-specific deployment notes live in the agent README.

Expect some framework APIs and conventions to change. This repo keeps fixture installs and typechecks in CI so generated agents stay honest as the ecosystem moves.

## For Coding Agents

If you are an AI coding agent working in this repository, start here:

1. Read `registry/<agent>/atom.json` for catalog metadata, targets, env vars, and connections.
2. Read `registry/<agent>/README.md` for human setup and usage.
3. Edit source under `registry/<agent>/shared/` and `registry/<agent>/targets/`. The generator discovers files from this folder layout.
4. Run `pnpm generate` after changing manifests or agent source.
5. Run `pnpm check` before finishing.

Do not hand-edit generated registry files unless you are debugging the generator. Generated files live under:

```text
public/r/
public/index.json
registry.json
```

## Add Your Own Agent

Create a folder under `registry/`:

```text
registry/my-agent/
  atom.json
  README.md
  shared/
    instructions.md
    skills/
    lib/
  targets/
    eve/
    flue/
```

Minimum requirements:

- Globally unique `name` in `atom.json`.
- At least one target: `eve`, `flue`, or both.
- README with setup and usage instructions.
- Real source code, not placeholder logic.
- No secrets committed to the repo.
- `pnpm check` passes.

The generator validates manifests, taxonomy, required README sections, generated registry files, and fixture installs.

`atom.json` is intentionally small. Runtime behavior belongs in files:

```json
{
  "$schema": "https://atomeve.dev/schema/atom.json",
  "name": "facebook-ads",
  "title": "Facebook Ads Agent",
  "description": "Reviews campaign performance and proposes daily budget and creative actions.",
  "category": "ads",
  "family": "growth",
  "targets": ["eve", "flue"],
  "integrations": ["facebook-ads"],
  "connections": [{ "name": "facebook-ads", "type": "custom-tool", "auth": "env" }],
  "requiredEnv": ["FB_ACCESS_TOKEN", "FB_AD_ACCOUNT_ID"]
}
```

Source paths are inferred:

- `shared/instructions.md` becomes Eve instructions and shared prompt source.
- `shared/skills/*` installs as framework-native skill files.
- `shared/lib/*` installs into target-specific library paths.
- `targets/eve/agent.ts` is the Eve child-agent entrypoint.
- `targets/eve/schedules/*` installs as namespaced Eve root schedule shims.
- `targets/flue/agent.ts` is the Flue agent entrypoint.
- `targets/flue/workflows/*` installs as Flue workflows.

For example, cron timing belongs in `targets/eve/schedules/daily.ts` or the target-specific scheduling/workflow file, not in `atom.json`.

## Repository Layout

```text
apps/
  web/                    # Static generated catalog
packages/
  cli/                    # atom-eve CLI
  registry-generator/     # atom.json -> shadcn registry + site index
  schemas/                # Shared schemas
registry/
  facebook-ads/           # Reference agent package
fixtures/
  eve/                    # Minimal install/typecheck fixture
  flue/                   # Minimal install/typecheck fixture
public/
  r/                      # Generated shadcn registry items
  index.json              # Generated website/catalog index
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

## Current Status

This repo is in early implementation. The first reference package is `facebook-ads`, with both Eve and Flue targets. The goal is to grow into a broad catalog of high-quality, installable agents.

## License

MIT
