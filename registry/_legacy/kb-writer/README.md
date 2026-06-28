# Knowledge Base Writer Agent

## What it does

Reviews your recent [Intercom](https://www.intercom.com) support conversations, clusters the recurring questions into themes, and turns the most common themes into knowledge base articles. For each theme it drafts a new article or proposes an update to an existing one, and it flags topics where high question volume suggests the documentation is missing or unclear.

It is draft-first: every article comes back as an operator-ready draft with a proposed title and outline grounded in the clustered conversations. The agent never publishes articles, edits live docs, or replies to customers. The only custom tool is a read-only Intercom conversation reviewer.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add kb-writer
```

Target overrides:

```bash
npx atom-eve add kb-writer --target eve
npx atom-eve add kb-writer --target flue
```

## Setup

Create an Intercom access token from your Intercom workspace (Settings → Developers / Developer Hub) with read access to conversations.

Required environment variables:

```bash
INTERCOM_ACCESS_TOKEN=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent conversations and draft this week's articles, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (runs Mondays at 09:00).
- Flue installs an agent plus `src/workflows/kb-writer-weekly.ts`.

The agent reads recent conversations, clusters recurring questions, then drafts articles and flags documentation gaps. Review the drafts and publish approved articles from Intercom Help Center yourself, or add your own write tool.

## Connections and auth

This package uses a custom Intercom tool with env-token auth because the Intercom conversation search endpoint is outside the framework-native toolset. The access token is read by the installed project at runtime via `INTERCOM_ACCESS_TOKEN`.

## Limitations

- The reference implementation is read-only: it searches recent conversations and clusters them, but it does not read existing Help Center articles, so create-vs-update is a suggestion for the operator to confirm.
- Clustering is keyword-based and deterministic; review the proposed topics and merge or split themes as needed before drafting.
- Publishing articles, editing live documentation, and replying to customers are intentionally left to the operator or a write tool you add yourself.
- Always review drafted article copy and the target documentation before publishing.
