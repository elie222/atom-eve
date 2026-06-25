# Facebook Ads Agent

## What it does

Reviews Facebook Ads campaign performance and proposes daily budget, targeting, and creative actions.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add facebook-ads
```

Target overrides:

```bash
npx atom-eve add facebook-ads --target eve
npx atom-eve add facebook-ads --target flue
```

## Setup

Create or choose a Facebook app with Marketing API access, then create a token with read access to the ad account you want the agent to inspect.

Required environment variables:

```bash
FB_ACCESS_TOKEN=...
FB_AD_ACCOUNT_ID=act_...
```

## Usage

Run the agent manually to review recent campaign performance, or wire the installed schedule/workflow into your deployment to run the daily review.

The agent reads campaign insights, calculates simple spend and CPA movement, and returns suggested actions. It does not mutate campaigns by default.

## Connections and auth

This package uses a custom Facebook Ads tool with env-token auth. Tokens are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only.
- The included heuristic is intentionally conservative; adapt thresholds for your account.
- Always review recommendations before changing live budgets or campaigns.
