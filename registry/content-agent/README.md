# Content

A research-backed content agent that turns current market conversation into an approval-ready content pipeline.

## What it does

Researches current conversations and turns useful signals into topic briefs, editorial calendars, hooks, outlines, social posts, newsletter sections, short-form video scripts, and draft content. It uses the `last30days` skill for current conversation research and can use Perplexity or Exa when those keys are configured for that skill.

It is read-only by default: it drafts and plans, but never posts, schedules, sends, or queues content.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add content-agent
```

This copies the agent into `agent/` in your eve app and pulls the `last30days` skill from skills.sh at install time.

## Setup

No credentials are required for the base workflow.

After installing:

- Edit `agent/instructions.md` with your audience, positioning, channels, approval rules, claim standards, and preferred formats.
- Save reviewed outputs under `reports/content-agent/history` if you want the agent to avoid repeated angles.
- Configure optional `last30days` source keys for richer current-topic coverage.

The remote `last30days` skill works with free sources such as Reddit, Hacker News, Polymarket, and GitHub. For richer coverage, run its first-use setup and add optional source keys in `~/.config/last30days/.env`, such as `EXA_API_KEY` or Perplexity/OpenRouter keys.

If remote skill installation is skipped, install it manually:

```bash
npx skills add mvanhorn/last30days-skill@last30days
```

## Usage

Run the agent on demand with a topic, audience, or campaign goal:

```text
Research the last 30 days around AI sales engineering tools and produce a two-week LinkedIn and YouTube content plan for technical founders.
```

You can also use the bundled weekly schedule. Scheduled content plans appear in the Eve run session. Save reviewed runs under `reports/content-agent/history` so future runs can avoid repeats.

## Connections and auth

This agent has no external service connection and no required environment variables. Optional keys for Exa, Perplexity, X, YouTube, Bluesky, and other sources belong to the installed `last30days` configuration, not this registry manifest.

## Limitations

- The agent drafts and plans only; it never posts, schedules, sends, or queues content.
- Current-research quality depends on the installed `last30days` skill and optional source keys.
- It does not invent customer quotes, metrics, screenshots, rankings, or claims; thin evidence is marked as thin.
- Lightweight history comes only from files you persist under `reports/content-agent/history`.
