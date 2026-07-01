# PPC Assist

## What it does

Finds the Amazon PPC decisions that matter today and turns them into a clear action list.

Each run it:
- reads store, product, campaign, keyword, search-term, strategy, suggestion, audit, and bid-estimate data from PPC Assist
- flags wasted spend, ACOS/TACOS drift, budget pressure, weak campaigns, missing campaigns, negative keyword opportunities, and pending automation suggestions
- explains the evidence behind each recommended action
- applies PPC Assist changes only after approval

You get a concise triage report with priorities, evidence, blockers, and any approved changes.

## Setup

1. Create a PPC Assist API token with `mcp-access` and `mcp-write`, since account-changing actions are available behind approval.
2. Set the target store, markets, KPI thresholds, lifecycle notes, exclusions, and write policy in `agent/instructions.md`.
