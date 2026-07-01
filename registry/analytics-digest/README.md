# Analytics Digest

## What it does

Turns your PostHog event trends into a plain-language weekly digest you can skim in a minute.

Reads your project's event trends and writes a short Markdown digest that:
- leads with the headline movement
- calls out events that rose or fell materially week over week
- flags possible tracking regressions, releases, or real usage shifts
- notes the data window and any data-quality caveats

## Setup

A PostHog personal API key with read access, and your project ID. Set your project context and reporting focus in `agent/instructions.md`.
