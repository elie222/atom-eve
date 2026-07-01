---
name: ppc-assist
description: Use when running PPC Assist Amazon PPC triage, interpreting PPC Assist metrics, reviewing search terms and suggestions, or preparing approval-gated account changes.
---

# PPC Assist Workflow

Use the PPC Assist connection as the account's primary source of truth. The connection returns raw store, campaign, product, keyword, search-term, strategy, suggestion, audit, and bid-estimate facts. You do the judgment and writing.

## Discovery

Before calling an operation, use `connection_search` for the relevant PPC Assist capability. Inspect the discovered tool names and input schemas, then call the qualified `ppcassist__...` tool.

Use explicit date ranges when dates are named. Use rolling `period_days` only when the user asks for a relative window or no exact dates are configured.

## Store Selection

Start with `list_stores` when the target store is not already clear. If exactly one store is available, use it. If multiple stores are available and no target store is configured, stop and ask the user to choose one.

For an agency or multi-store view, use `get_all_stores_overview` for account-level prioritization, then drill into one selected store before making store-level recommendations.

## Triage Loop

For a broad daily or weekly run, gather:

- store overview and account strategy
- products and product goals
- campaigns and campaign details for the highest-impact candidates
- keywords and search terms
- pending suggestions
- applied strategies, campaigns without strategy, and products without campaigns
- bid estimates when bid changes are under consideration
- activity, orders, listing details, and search query performance when product context matters

Run the audit operation for broad account-health checks or when the user asks for an audit. Treat audit output as evidence, not as an automatic decision.

## Interpreting Metrics

Prioritize issues by impact, confidence, and reversibility.

- ACOS/TACOS drift: compare to configured targets and product lifecycle. Launch products may tolerate higher ACOS; mature products need stronger efficiency.
- Wasted spend: flag spend with no sales only when the spend is meaningful for that account and window.
- Search terms: separate non-converters, proven converters, and terms that need exact control or negatives.
- Campaign coverage: flag products without campaigns and campaigns without strategies when they conflict with the configured growth plan.
- Budget pressure: distinguish constrained proven campaigns from campaigns that should not receive more budget.
- Suggestions: review the evidence behind each suggestion before recommending validation or ignore.

Do not rely on hardcoded thresholds alone. Use account scale, product phase, recent activity, and strategy context.

## Write Safety

Writes require both explicit user intent and tool approval. This includes campaign state changes, budgets, placements, bidding strategy, keyword bids, paused keywords, new targets, negatives, COGS, suggestion validation or ignore, and account strategy updates.

Before a write, present the exact change, current state, proposed state, evidence, expected effect, and rollback path. Keep writes focused and reversible. If the request is broad, turn it into a ranked action list and ask the user which actions to apply.

Never make up missing campaign IDs, keyword IDs, store IDs, bid values, targets, or negative terms.
