# Social Scheduler Agent

## What it does

Turns approved content briefs into a draft schedule of social posts across X and LinkedIn via [Ayrshare](https://app.ayrshare.com/api). It is draft-first: the agent reads your existing Ayrshare queue or post analytics, then returns a queued-post plan (copy, target platforms, and suggested schedule time) for operator approval. It does not auto-post or schedule anything on its own.

Content strategy and cadence come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `content-strategy` skill, which the installer pulls from skills.sh at install time. The only custom tool is a small Ayrshare API reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add social-scheduler
```

Target overrides:

```bash
npx atom-eve add social-scheduler --target eve
npx atom-eve add social-scheduler --target flue
```

## Setup

Create an Ayrshare API key from your Ayrshare dashboard with access to your linked social profiles.

Required environment variables:

```bash
AYRSHARE_API_KEY=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

The installer also pulls the shared `coreyhaines31/marketingskills@content-strategy` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@content-strategy
```

## Usage

Run the agent manually to review the queue and draft this week's posting plan, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (cron `0 9 * * 1`).
- Flue installs an agent plus `src/workflows/social-scheduler-weekly.ts`.

The agent reads your Ayrshare queue, then uses the content-strategy skill to turn approved briefs into a queued-post plan. Review and schedule approved posts from Ayrshare yourself, or add your own write tool.

## Connections and auth

This package uses a custom Ayrshare tool with env-token auth because the Ayrshare post endpoint is outside the framework-native toolset. The API key is read by the installed project at runtime.

## Limitations

- The reference implementation is read-only: it lists queued/historical posts or post analytics; it does not create, schedule, edit, or delete posts.
- Auto-posting and scheduling are intentionally left to the operator or a write tool you add yourself.
- Always review the drafted copy, target platforms, and schedule times before publishing to real audiences.
