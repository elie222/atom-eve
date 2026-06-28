# Keyword Researcher Agent

## What it does

Researches keywords and topics for this project's site using [DataForSEO](https://dataforseo.com). It expands your seed terms into keyword ideas with search volume and difficulty, classifies each idea by search intent, and clusters them into a prioritized content map so you can decide what to build first. It is read-only: it only reads keyword data and never publishes pages or changes rankings.

Keyword strategy and content-map structure come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `programmatic-seo` skill, which the installer pulls from skills.sh at install time. The only custom tool is a small DataForSEO reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add keyword-researcher
```

Target overrides:

```bash
npx atom-eve add keyword-researcher --target eve
npx atom-eve add keyword-researcher --target flue
```

## Setup

Create DataForSEO API credentials from your DataForSEO dashboard. The agent authenticates with HTTP Basic auth built from your login and password.

Required environment variables:

```bash
DATAFORSEO_LOGIN=...
DATAFORSEO_PASSWORD=...
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

The installer also pulls the shared `coreyhaines31/marketingskills@programmatic-seo` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@programmatic-seo
```

## Usage

Run the agent manually with a set of seed keywords, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (runs Mondays at 09:00).
- Flue installs an agent plus `src/workflows/keyword-researcher-weekly.ts`.

The agent calls DataForSEO with your seeds, then uses the programmatic SEO skill to cluster the ideas by intent and recommend which clusters to target first. Review the prioritized content map and turn approved clusters into briefs yourself, or add your own write tool.

## Connections and auth

This package uses a custom DataForSEO tool with env-based Basic auth because the keyword-ideas endpoint is outside the framework-native toolset. The login and password are read by the installed project at runtime and combined into a Basic auth header.

## Limitations

- The reference implementation is read-only: it reads keyword ideas and clusters them. It does not publish content, submit URLs, or change rankings.
- Clustering is a deterministic intent-plus-token heuristic on top of the API results; treat the content map as a starting point and refine it with the programmatic SEO skill.
- Search volume and difficulty come straight from DataForSEO for the requested location and language; verify both before committing budget to a cluster.
