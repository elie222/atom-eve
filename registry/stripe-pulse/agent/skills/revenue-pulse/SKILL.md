---
description: Use when writing the weekly Stripe revenue & churn pulse — how to pull facts with the stripe and posthog-cli CLIs in the sandbox, then post to Slack.
---

# Revenue & churn pulse workflow

You produce a grounded weekly revenue & churn pulse. All numbers come from CLIs
you run in the sandbox with `bash`. Never invent a figure.

## 0. Window

Compute the lookback window in Unix seconds. Default 7 days:

```bash
UNTIL=$(date +%s); SINCE=$(( UNTIL - 7*86400 ))
```

## 1. Stripe facts (`stripe` CLI)

Auth comes from `STRIPE_API_KEY` (a restricted, read-only key) in the env.
Every command returns JSON — pipe through `jq`. Add `--live` for live data
(default is test mode). Use `--limit` and paginate with `--starting-after`.

- New / active subscriptions in the window:
  ```bash
  stripe subscriptions list --status active --created "gte=$SINCE" --limit 100
  ```
- Cancellations (churn) in the window — read the events, not just current state:
  ```bash
  stripe events list --type "customer.subscription.deleted" --created "gte=$SINCE" --limit 100
  ```
- Failed payments / dunning risk:
  ```bash
  stripe invoices list --status open --created "gte=$SINCE" --limit 100
  stripe events list --type "invoice.payment_failed" --created "gte=$SINCE" --limit 100
  ```
- At-risk subscriptions (set to cancel, or past_due):
  ```bash
  stripe subscriptions list --status past_due --limit 100
  stripe get /v1/subscriptions -d "status=active" -d "limit=100" \
    | jq '.data[] | select(.cancel_at_period_end == true)'
  ```

MRR: derive it from the subscription items' recurring prices
(`items.data[].price.unit_amount * quantity`, normalized to monthly). Sum across
active subscriptions; do not guess. Compare against the prior window the same way.

`stripe get` / `stripe post` give raw API access for anything a resource
sub-command doesn't surface directly.

## 2. Engagement cross-reference (`posthog-cli`)

For each at-risk customer, check product engagement. Auth via
`POSTHOG_CLI_API_KEY` and `POSTHOG_CLI_PROJECT_ID`. Run HogQL and read JSON lines:

```bash
posthog-cli exp query run "
  SELECT properties.\$customer_id AS customer, count() AS events, max(timestamp) AS last_seen
  FROM events
  WHERE timestamp > now() - INTERVAL 30 DAY
    AND properties.\$customer_id IN ('cus_123','cus_456')
  GROUP BY customer"
```

## 3. Write the pulse

- Lead with the headline: MRR direction (with the number and % change) and net churn.
- 3-5 supporting facts, each traceable to a CLI result you ran.
- 2-3 prioritized actions, ordered by **revenue at risk**, not count.
- If a fact is missing, say so. Never fabricate.

## 4. Post to Slack

This agent has a bidirectional Slack channel. Reply in the active thread (a
schedule run opens one for you). The final assistant message becomes the Slack post.
