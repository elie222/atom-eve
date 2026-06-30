# Onboarding Coach

## What it does

Reads your activation funnel in PostHog through the official `posthog-cli`, following a discover then inspect then call workflow so it never guesses tool names or schemas. It maps distinct users reaching each onboarding step, ranks the steps with the worst drop-off before activation, and drafts a nudge for each high drop-off step with its target step and trigger condition. You get a Markdown digest: funnel summary, worst steps ordered by severity, a draft nudge per step, and caveats.

## Setup

Create a PostHog personal API key with read access to your project, and note the project ID. For EU or self-hosted PostHog, pass `--host` to `posthog-cli` (for example `https://eu.posthog.com`). Set your activation events and lookback window in `agent/instructions.md`; it defaults to a generic `signed_up -> onboarding_started -> key_feature_used -> activated` funnel.
