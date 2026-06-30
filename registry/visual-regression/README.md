# Visual Regression

## What it does

Opens configured screens in a real browser, captures current screenshots, compares them against a saved baseline, and reports unintended UI differences such as layout shifts, missing or clipped elements, color, spacing, and typography changes, broken images, and overflow. Findings come back as a Markdown report ordered by severity with recommended fixes. When a screen has no baseline yet, it says it is establishing one rather than flagging a regression.

## Setup

Set your screen list and target URLs in `agent/instructions.md`. Place known-good reference images under `reports/visual-regression/baseline`, which the agent treats as read-only.
