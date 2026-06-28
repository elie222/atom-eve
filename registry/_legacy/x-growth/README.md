# X Growth Agent

## What it does

Monitors brand and keyword mentions on X (via the [X recent-search API](https://api.twitter.com/2/tweets/search/recent)) and drafts engagement replies and original post ideas grounded in your brand context. It is read-only and draft-first: the agent searches recent mentions, then returns reply drafts and post ideas for operator approval. It never posts, replies, likes, or follows on its own.

Voice, hook quality, and engagement judgement come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `content-strategy` skill, which the installer pulls from skills.sh at install time. The only custom tool is a small X recent-search reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add x-growth
```

Target overrides:

```bash
npx atom-eve add x-growth --target eve
npx atom-eve add x-growth --target flue
```

## Setup

Create an X (Twitter) app with the v2 API and copy its bearer token. The recent-search endpoint requires an elevated/Basic-or-above access tier.

Required environment variables:

```bash
X_BEARER_TOKEN=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

The installer also pulls the shared `coreyhaines31/marketingskills@content-strategy` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@content-strategy
```

## Usage

Run the agent manually to monitor mentions and draft engagement, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (cron `0 9 * * *`).
- Flue installs an agent plus `src/workflows/x-growth-daily.ts`.

The agent searches recent mentions for your configured query, then uses the content-strategy skill to draft replies and post ideas. Review and publish approved drafts from X yourself, or add your own write tool.

## Connections and auth

This package uses a custom X tool with env-token (bearer) auth because the X recent-search endpoint is outside the framework-native toolset. The bearer token is read by the installed project at runtime.

## Limitations

- The reference implementation is read-only: it searches recent mentions; it does not post, reply, like, follow, or read protected/historical data beyond the recent-search window.
- The recent-search endpoint only covers roughly the last 7 days and requires a sufficient X API access tier.
- Posting and replying are intentionally left to the operator or a write tool you add yourself.
- Always review the drafted replies and post ideas before publishing to real audiences.
