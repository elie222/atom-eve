# Experiment Analyst

## What it does

Tells you which A/B experiments won, which are still inconclusive, and what to do next.

Each run it:
- reads your experiment configuration and results from PostHog
- confirms the events and properties each analysis relies on actually exist
- checks statistical significance and names a winner only when the data supports it
- returns a Markdown report: experiments reviewed, significance and winners, key learnings, and recommended actions

It is conservative: no winner is called for an experiment still running or short of significance. Roll-out suggestions are recommendations for you to approve.

## Setup

Create a PostHog personal API key with read access, and note your project ID. For EU cloud or self-hosted PostHog, set your region host.
