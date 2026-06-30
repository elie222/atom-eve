# Funnel Analyst

## What it does

Builds funnel and retention/cohort views from your PostHog project, grounding the steps in your business context and real product event names rather than guessing. It discovers the right PostHog tools, verifies that the events and properties you plan to use exist, then runs the analysis. You get a Markdown report with an executive summary, what was checked (funnel steps, retention definition, date range), findings ordered by severity (the biggest drop-off step and the retention trend), recommended fixes, and a follow-up analysis prompt.

## Setup

Create a PostHog personal API key with read access and note your project ID. For EU cloud or self-hosted PostHog, point the CLI at your region with a host flag.

Give the agent your business context and real product event names so the funnel matches your product.
