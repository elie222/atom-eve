# Content Ideation Agent

A reasoning agent that turns recent business context into an approval-ready content queue.

## What it does

Turns your recent business context (product updates, customer calls, support themes, sales objections, metrics, founder opinions) into a practical content queue a human can approve: YouTube topics, tweet/thread ideas, hooks, outlines, and approval-ready social copy. It prefers specific ideas tied to real recent context, checks prior ideation history to avoid repeating angles, and clearly marks all copy as not posted. It does not auto-post, call Slack or Postiz APIs, or invent customer names, metrics, or quotes.

This agent uses no sandbox and no external integration — it reasons over the context and history you provide. The capability is the model; you supply the recent-context inputs in the prompt or local notes.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add content-ideation
```

This copies the agent into `agent/` in your eve app.

## Setup

No API keys or environment variables are required. After installing, customize `agent/instructions.md` to reflect your real audience, channels, product language, approval rules, and publishing preferences.

Give the agent recent context each run (changelogs, call notes, metrics, decisions) or point it at local notes. It can optionally consume `mvanhorn/last30days-skill` output when your project already uses that skill as a recent-context source; it does not vendor or assume that skill's code, and continues from the context you provide if it is unavailable.

## Usage

Run the agent on demand with your recent context, or let the bundled weekly schedule (Mondays at 10:00 UTC) run it automatically. The schedule runs in task mode: eve starts the agent on its cron tick and the content queue lands in that run's session. There is no external channel — the queue is the session output.

It returns sections in order: source context used, repetition check, YouTube topics, tweet/thread ideas, hooks bank, outlines, approval-ready social copy, Slack approval copy, and history update notes. Save approved and rejected items under `reports/content-ideation/history` so the next run avoids repeats.

## Connections and auth

This agent has no external service connection and no required environment variables. It does not call Slack, Postiz, or any publishing API; Slack approval copy and Postiz-ready fields are drafts only.

## Limitations

- The agent only ideates; it never posts, schedules, or queues content, and it never claims a message was sent.
- Idea quality depends on the recent context you supply; with thin context it asks for more rather than inventing facts.
- It does not invent customer names, metrics, screenshots, or quotes; approval-ready copy is pasteable but marked as not posted.
- Run history is whatever you persist under `reports/content-ideation/history`; an ephemeral environment has no memory between runs.
