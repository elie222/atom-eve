# Performance Auditor

## What it does

Opens each configured URL in a real browser and reads Navigation Timing and Resource Timing values: time to first byte, DOMContentLoaded, full load, largest contentful paint, total bytes transferred, request count, the heaviest resources, and render-blocking scripts and styles. It names the single worst bottleneck per page and proposes one behavior-preserving fix for it, such as compressing an image, deferring a script, enabling compression, or code-splitting a bundle. You get a Markdown report with the metrics, the bottleneck, the fix, screenshots, and deltas from prior runs. Every number is grounded in an observed measurement.

## Setup

Provide the URLs to audit in the prompt, or point the agent at local env or config notes that list them. Tune `agent/instructions.md` for your performance budgets and reporting preferences.
