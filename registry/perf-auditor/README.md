# Performance Auditor

## What it does

Tells you the single worst thing slowing each page down, and the one fix to apply. For every configured URL it:

- opens the page in a real browser and reads Navigation Timing and Resource Timing
- reports TTFB, DOMContentLoaded, full load, largest contentful paint, total bytes, request count, heaviest resources, and render-blocking scripts and styles
- names the worst bottleneck per page and proposes one behavior-preserving fix, such as compressing an image, deferring a script, enabling compression, or code-splitting a bundle

You get a Markdown report with the metrics, the bottleneck, the fix, screenshots, and deltas from prior runs. Every number traces to an observed measurement.

## Setup

Set the URLs to audit and your performance budgets in `agent/instructions.md`.
