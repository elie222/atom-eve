# Content Agent

A research-backed content agent that turns current market conversation into an approval-ready content pipeline.

## What it does

Researches what people are discussing right now, finds high-signal angles across public communities and the web, and turns those signals into practical content work: topic briefs, editorial calendars, hooks, outlines, social posts, newsletter sections, short-form video scripts, and approval-ready drafts. It uses the `last30days` skill for current conversation research and can benefit from Perplexity or Exa when those keys are configured for that skill.

It is read-only by default. It drafts and plans, but it does not post, schedule, send, or queue content in any external system.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add content-agent
```

This copies the agent into `agent/` in your eve app and pulls the `last30days` skill from skills.sh at install time.

## Setup

No credentials are required for the base workflow.

After installing, customize the agent for your project:

- Edit `agent/instructions.md` with your audience, product positioning, channels, approval rules, claim standards, and preferred content formats.
- Add durable context or reviewed outputs under `reports/content-agent/history` if you want the agent to avoid repeated angles across runs.
- Configure optional `last30days` source keys if you want richer current-topic coverage.

The remote `last30days` skill works immediately with free sources such as Reddit, Hacker News, Polymarket, and GitHub. For richer coverage, run its first-use setup and add optional source keys in `~/.config/last30days/.env`, such as `EXA_API_KEY` for semantic web search or Perplexity/OpenRouter keys for grounded synthesis. If remote skill installation is skipped, install it manually with:

```bash
npx skills add mvanhorn/last30days-skill@last30days
```

## Usage

Run the agent on demand with a topic, audience, or campaign goal:

```text
Research the last 30 days around AI sales engineering tools and produce a two-week LinkedIn and YouTube content plan for technical founders.
```

You can also let the bundled weekly schedule run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the content plan lands in that run's session. There is no external channel.

Save reviewed runs under `reports/content-agent/history` so the next run can avoid repeated angles and build on approved work.

## Connections and auth

This agent has no external service connection and no required environment variables. The `last30days` skill is resolved from skills.sh at install time rather than vendored in this package. Optional keys for Exa, Perplexity, X, YouTube, Bluesky, and other sources belong to the installed `last30days` configuration, not this registry manifest.

## Limitations

- The agent drafts and plans only; it never posts, schedules, sends, or queues content.
- Current-research quality depends on the installed `last30days` skill and any optional source keys you configure.
- It does not invent customer quotes, metrics, screenshots, rankings, or claims. Thin evidence is marked as thin.
- It relies on files you keep under `reports/content-agent/history` for lightweight history; ephemeral environments have no memory between runs.
