# Content Ideation

A reasoning agent that turns recent business context into an approval-ready content queue.

## What it does

Turns recent business context, such as product updates, customer calls, support themes, sales objections, metrics, and founder opinions, into YouTube topics, tweet/thread ideas, hooks, outlines, and approval-ready social copy. It checks prior ideation history to avoid repeated angles and marks all copy as not posted.

It does not auto-post, call Slack or Postiz APIs, or invent customer names, metrics, or quotes.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add content-ideation
```

This copies the agent into `agent/` in your eve app.

## Setup

No API keys or environment variables are required.

After installing, customize `agent/instructions.md` with your audience, channels, product language, approval rules, and publishing preferences. Give the agent recent context each run, or point it at local notes. It can also use `mvanhorn/last30days-skill` output when your project already has that skill installed.

## Usage

Run the agent on demand with recent context, or use the bundled weekly schedule (Mondays at 10:00 UTC). It returns source context used, repetition checks, content ideas, hooks, outlines, approval-ready copy, Slack approval copy, and history update notes.

Save approved and rejected items under `reports/content-ideation/history` so future runs avoid repeats.

## Connections and auth

This agent has no external service connection and no required environment variables. Slack approval copy and Postiz-ready fields are drafts only.

## Limitations

- The agent only ideates; it never posts, schedules, queues content, or claims a message was sent.
- Idea quality depends on the context you supply; with thin context it asks for more rather than inventing facts.
- It does not invent customer names, metrics, screenshots, or quotes.
- Run history exists only where you persist it under `reports/content-ideation/history`.
