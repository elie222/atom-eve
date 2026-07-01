# Claim Checker

## What it does

Catches the marketing claims that overstate your product before a customer or regulator does.

Crawls your marketing pages, inventories every customer-facing claim, and checks each against your product sources of truth. For each claim it records the exact wording, source URL, claim type, and a verdict of supported, unverified, or overstated, then ranks the flagged ones by risk:
- unsubstantiated metrics
- absolute or superlative language
- unsupported compliance assertions
- competitor comparisons

For each high-risk claim it drafts a defensible rewrite, and compares against prior runs to surface deltas. You get a Markdown report with the inventory, risk assessment, suggested repairs, and recommended actions.

## Setup

Set the pages it crawls, your product sources of truth, and your claims policy in `agent/instructions.md`.
