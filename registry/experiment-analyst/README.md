# Experiment Analyst

## What it does

Reads your A/B experiments from PostHog through the official `posthog-cli`: it confirms the events and properties each analysis relies on actually exist, checks statistical significance, and names a winning variant only when the data supports it. You get a Markdown report with an executive summary, the experiments reviewed, significance and winners, key learnings, and recommended actions for an operator to approve.

## Setup

Provide a PostHog personal API key with read access and your project ID. For EU cloud or self-hosted PostHog, pass `--host` to the CLI (for example `--host https://eu.posthog.com`).
