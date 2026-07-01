# Postiz Social Scheduler

## What it does

Runs your social content as a loop instead of a one-off. Each run it:

- reads your site for brand, product, and voice, and reads what your audience is talking about now (last30days)
- reviews how your past posts performed (Postiz analytics), so it repeats what worked and drops what did not
- drafts platform-native posts (X, LinkedIn, Instagram, TikTok) grounded in the site, current trends, and evidence
- creates them as drafts in Postiz and schedules the ones you approve, across your connected channels
- posts a review summary to Slack, and keeps a per-run history so the next run can measure movement

Ask it to fill the next several months in one pass and it drafts and schedules the whole calendar. It creates drafts by default and only schedules or publishes to your real channels when you approve the copy and the times.

Every claim traces to the site, its research, or the numbers it pulled; anything it cannot verify it flags rather than guessing.

## Setup

1. Connect your social channels in Postiz (a one-time OAuth per channel in Postiz), then get an API key at [platform.postiz.com/settings](https://platform.postiz.com/settings) (Settings, then Reveal). Self-hosting Postiz? Point it at your instance with `POSTIZ_API_URL`.
2. Set the site, brand voice, target platforms, and cadence in `agent/instructions.md`.
3. Connect Slack in Vercel and set the review channel so it can post the plan for approval.

History accumulates under `reports/postiz/`; keep it between runs, since the results loop depends on it.
