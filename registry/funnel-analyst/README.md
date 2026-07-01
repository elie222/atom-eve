# Funnel Analyst

## What it does

Shows where users drop off in your funnel and what to fix to convert more of them.

Each run it:
- builds funnel and retention/cohort views from your PostHog data
- grounds the steps in your business context and real product event names, not guesses
- verifies the events and properties it uses actually exist before running the analysis
- returns findings ordered by severity: the biggest drop-off step and the retention trend, with recommended fixes and a follow-up analysis prompt

## Setup

Create a PostHog personal API key with read access, and note your project ID. For EU cloud or self-hosted PostHog, set your region host.

Give the agent your business context and real product event names in `agent/instructions.md` so the funnel matches your product.
