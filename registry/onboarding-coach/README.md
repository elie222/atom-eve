# Onboarding Coach

## What it does

Finds users stuck before activation and drafts the right nudge for each onboarding step.

Each run it:
- reads your activation funnel in PostHog, verifying the events it uses actually exist
- maps distinct users reaching each onboarding step
- ranks the steps with the worst drop-off before activation
- drafts a nudge per high drop-off step, each with its target step and trigger condition

You get a Markdown digest: funnel summary, worst steps by severity, a draft nudge per step, and caveats. Nudges are drafts for you to approve; nothing is sent.

## Setup

Create a PostHog personal API key with read access, and note your project ID. For EU cloud or self-hosted PostHog, set your region host.

Set your activation events and lookback window in `agent/instructions.md`; it defaults to a generic `signed_up -> onboarding_started -> key_feature_used -> activated` funnel.
