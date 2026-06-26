# Feedback Aggregator Agent

## What it does

Takes feedback items from tickets, reviews, and community channels that you paste into the prompt (or keep in local config notes), dedupes them into themes, and ranks those themes by frequency x value. It is read-only: it summarizes and ranks what people are asking for so the team can prioritize, and it does not file tickets, reply to customers, or change anything.

The only custom tool is a small, network-free planner. It groups items by an explicit theme label when you provide one, otherwise by normalized text, then ranks each theme by frequency multiplied by the average value (for example account MRR or severity) you attach to its items.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add feedback-aggregator
```

Target overrides:

```bash
npx atom-eve add feedback-aggregator --target eve
npx atom-eve add feedback-aggregator --target flue
```

## Setup

No credentials are required. The agent works entirely from the feedback items supplied in the prompt or local notes, so there is nothing to configure beyond installing the package.

## Usage

Run the agent manually with a batch of feedback items, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts`.
- Flue installs an agent plus `src/workflows/feedback-aggregator-weekly.ts`.

Provide each item with its text, and where available a `source` (ticket, review, community), an optional explicit `theme` label, and an optional numeric `value` or weight. The agent calls the `aggregate_feedback` tool to dedupe the items into themes ranked by frequency x value, then presents the ranked themes with representative examples for your review. Decide what to act on yourself, or add your own write tool.

## Connections and auth

This package has no connections and reads no external services. The `aggregate_feedback` tool is a pure, network-free planner that operates only on the items you pass in, so there is no API key or OAuth to configure.

## Limitations

- The planner is read-only. It dedupes and ranks feedback; it does not file tickets, reply to customers, escalate, or change anything.
- Feedback items must be supplied in the prompt or local notes. The agent does not pull from a helpdesk, review platform, or community tool on its own.
- Theme grouping is deterministic: items merge when they share an explicit theme label or have near-identical text. Provide a `theme` field for higher-quality clustering of differently worded feedback.
- Always review the ranked themes before acting on them.
