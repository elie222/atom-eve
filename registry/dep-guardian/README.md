# Dependency Guardian Agent

## What it does

Reviews a GitHub repository's `package.json` and flags outdated or risky dependencies in risk order. It reads the manifest directly from GitHub (contents API), classifies each dependency by its version specifier — unpinned/non-registry sources first, then pre-1.0 and pre-release packages, then exactly pinned versions — and proposes grouped updates for you to apply.

It is draft-first and read-only: it never opens pull requests, edits `package.json`, or runs a package manager. Every result comes back as findings plus proposed update groups for operator approval. The only custom tool is a small GitHub manifest reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add dep-guardian
```

Target overrides:

```bash
npx atom-eve add dep-guardian --target eve
npx atom-eve add dep-guardian --target flue
```

## Setup

Create a GitHub personal access token (classic or fine-grained) with read access to the repository's contents. Set the repository to inspect as `owner/repo`.

Required environment variables:

```bash
GITHUB_TOKEN=...
GITHUB_REPO=owner/repo
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review dependencies on demand, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (runs `0 9 * * *`).
- Flue installs an agent plus `src/workflows/dep-guardian-daily.ts`.

The agent reads `package.json` from the configured repo, flags risky dependencies in risk order, and proposes grouped updates. Review the proposals and apply any upgrade yourself, or add your own write tool.

## Connections and auth

This package uses a custom GitHub tool with env-token auth because reading the repository manifest is outside the framework-native toolset. `GITHUB_TOKEN` and `GITHUB_REPO` are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only. It does not open pull requests, edit `package.json`, run `npm`/`pnpm`/`yarn`, or bump versions.
- Risk is inferred from the version specifier in `package.json` (unpinned ranges, non-registry sources, pre-1.0, pre-release, exact pins). It does not query the npm registry or a vulnerability database, so it does not detect specific CVEs or compute exact "latest" versions.
- It reads a single `package.json` (defaults to the repo root); monorepos with multiple manifests require running it per path.
- Always review proposed update groups before applying any change to real dependencies.
