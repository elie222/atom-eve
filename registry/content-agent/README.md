# Content Generator

## What it does

Researches current conversations with the `last30days` skill and turns the signals into a content pipeline: topic briefs, an editorial calendar, strategic pillars, hooks, outlines, draft copy for each channel's native format, and approval notes. Every market claim is tied to a cited source or your provided context, and thin or single-source evidence is flagged rather than smoothed over. It checks any saved history first to avoid repeating angles you have already used or rejected.

## Setup

Edit `agent/instructions.md` with your audience, positioning, channels, approval rules, and claim standards. Save reviewed runs under `reports/content-agent/history` so future runs can skip repeated angles. For richer research, configure the `last30days` skill's optional source keys (Exa, Perplexity, and similar) in its own config; the free sources work without them.
