# Competitor Analysis

## What it does

Reviews each configured competitor's homepage, pricing, product, feature, docs, changelog, blog, and CTA pages. It collects HTTP status, titles, meta, and visible text, and uses a real browser for screenshots, dynamic pages, and CTA flow inspection. You get a Markdown report covering positioning and message hierarchy, pricing and packaging, feature messaging and content, CTA flow, and notable deltas from prior runs, with every material claim grounded in an observed URL, screenshot, or artifact. When a page blocks automation, it records the blocker and continues with the rest. Prior reports and snapshots in `reports/competitor-analysis/history` give it a baseline to diff against; a fresh environment establishes a new one.

## Setup

List your competitors and the pages to review, plus your own positioning and reporting preferences, in `agent/instructions.md`.
