# Content Ideation Agent

## What it does

The Content Ideation Agent turns recent business context into an approval-ready content queue. It generates YouTube video topics, tweet or thread ideas, hooks, outlines, and polished social copy that a human can approve before anything is published.

The agent is designed for founder-led, product-led, or marketing teams that want a weekly or ad hoc ideation pass based on launches, customer conversations, product updates, metrics, sales objections, market shifts, and recent decisions.

Outputs include:

- YouTube topic candidates with audience, angle, promise, and outline.
- Tweet, thread, and short-form post ideas with hooks and final copy.
- Slack approval copy that can be pasted into an approval channel.
- Memory notes for `reports/content-ideation/history/...` so the next run avoids repeated ideas and records what was approved.

The package does not auto-post. It prepares copy for review.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add content-ideation
```

Target overrides:

```bash
npx atom-eve add content-ideation --target eve
npx atom-eve add content-ideation --target flue
```

## Setup

No credentials are required by default.

Give the installed agent access to recent context through prompts, local notes, exported reports, CRM summaries, analytics snapshots, meeting notes, changelogs, or product updates. The optional [`mvanhorn/last30days-skill`](https://github.com/mvanhorn/last30days-skill) can be used as an input/source for recent business context if your project already supports that skill pattern. This registry package intentionally does not vendor external skill code.

Recommended local structure:

```text
reports/content-ideation/history/
```

Store prior runs and approval outcomes there, for example:

```text
reports/content-ideation/history/2026-06-25-weekly.md
reports/content-ideation/history/approved.md
reports/content-ideation/history/rejected.md
```

If the agent cannot read files directly in your runtime, paste the relevant history into the prompt.

## Usage

Run the agent weekly or whenever there is enough new business context to mine for ideas.

Example prompt:

```text
Create this week's content ideation queue.

Use the following inputs:
- Product updates: <paste or link>
- Customer themes: <paste or link>
- Revenue or funnel notes: <paste or link>
- Prior approved ideas: <paste or link reports/content-ideation/history/approved.md>
- Prior rejected or used ideas: <paste or link reports/content-ideation/history/rejected.md>

Return YouTube topics, tweet/thread ideas, hooks, outlines, final social copy, Slack approval copy, and history notes.
```

The Slack section should be approval-oriented, for example:

```text
Content ideas ready for review.

Please approve, edit, or reject each item:
1. YouTube: <title> - <why now>
2. Thread: <hook> - <target reader>
3. Post: <copy>
```

Do not configure the agent to post directly to Slack, Twitter/X, YouTube, LinkedIn, Postiz, or any publishing system without adding a separate reviewed integration.

## Connections and auth

This package has no runtime auth requirement. Slack is documented as an approval destination for prepared copy, not as an auto-posting integration.

Postiz is a future optional publishing integration/spec for teams that want a reviewed path from approved content into scheduling. This package does not implement Postiz calls, API auth, scheduling, or publishing.

## Limitations

- The agent depends on the quality and recency of the context you provide.
- It does not verify facts unless you provide source material or give it a research-capable runtime.
- It does not auto-post or schedule content.
- Memory/history is lightweight and file-based; adapt it if your team uses a database, CMS, or approvals tool.
