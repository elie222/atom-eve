# Claim Checker

## What it does

Crawls your marketing pages in a real browser, inventories every customer-facing claim, and checks each one against your product sources of truth. It records the exact wording, source URL, claim type, and a verdict of supported, unverified, or overstated, then ranks the flagged claims by risk: unsubstantiated metrics, absolute or superlative language, unsupported compliance assertions, and competitor comparisons. For each high-risk claim it drafts a defensible rewrite, and compares against prior runs to surface deltas. You get a Markdown report with the inventory, risk assessment, suggested repairs, and recommended actions.

## Setup

Set the pages it crawls and your product sources of truth in `agent/schedules/weekly.ts`, and tune `agent/instructions.md` for your claims policy and review preferences.
