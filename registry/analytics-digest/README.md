# Analytics Digest

## What it does

Queries your PostHog project's event trends with `posthog-cli` and writes a short, plain-language weekly digest. It leads with the headline movement, calls out events that rose or fell materially week over week, and flags possible tracking regressions, releases, or real usage shifts. You get a Markdown digest with the data window and any data-quality caveats.

## Setup

Create a PostHog personal API key with read access and note your project ID. For EU cloud or self-hosted PostHog, pass `--host` to the CLI (for example `--host https://eu.posthog.com`).
