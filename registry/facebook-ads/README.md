# Facebook Ads Agent

## What it does

Reviews Facebook Ads campaign performance and proposes daily budget, targeting, and creative follow-up for an operator to approve.

The agent uses framework-native agent, schedule, workflow, and skill files. The only custom tool is the small Facebook Marketing API reader needed to fetch account insights.

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

Create or choose a Facebook app with Marketing API access, then create a token with read access to the ad account you want the agent to inspect. Do not grant campaign management scopes unless you intentionally add your own write tools later.

Required environment variables:

```bash
FB_ACCESS_TOKEN=...
FB_AD_ACCOUNT_ID=act_...
```

`FB_AD_ACCOUNT_ID` should include the `act_` prefix. Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent campaign performance, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts`.
- Flue installs an agent plus `src/workflows/facebook-ads-daily.ts`.

The agent reads yesterday's campaign insights, compares them with the previous day, calculates spend/conversion/CPA movement, and returns suggested actions. It does not mutate campaigns by default.

For lightweight run history, save the daily response somewhere your operator can review, such as `runs/facebook-ads/YYYY-MM-DD.md` or a team ticket/comment. If you include prior summaries in the next prompt or workflow context, the agent can mention broader trends without needing a database.

Local smoke test with mocked Facebook responses:

```bash
FB_ACCESS_TOKEN=test FB_AD_ACCOUNT_ID=act_123 pnpm exec tsx -e '
import { fetchCampaignInsights, recommendCampaignActions } from "./agent/lib/facebook.ts";
const responses = [
  { data: [{ campaign_id: "1", campaign_name: "Prospecting", spend: "120", actions: [{ action_type: "purchase", value: "0" }] }] },
  { data: [{ campaign_id: "1", campaign_name: "Prospecting", spend: "80", actions: [{ action_type: "purchase", value: "2" }] }] }
];
const fetchMock = async () => new Response(JSON.stringify(responses.shift()));
void (async () => {
  const insights = await fetchCampaignInsights({ since: "2026-06-24", until: "2026-06-24" }, { since: "2026-06-23", until: "2026-06-23" }, fetchMock as typeof fetch);
  console.log(JSON.stringify({ insights, recommendations: recommendCampaignActions(insights) }, null, 2));
})();
'
```

Run the smoke test from an installed Eve app folder after `npx atom-eve add facebook-ads --target eve`. For Flue, change the import path to `./src/lib/agents/facebook-ads/facebook.ts`.

## Connections and auth

This package uses a custom Facebook Ads tool with env-token auth because the Facebook Marketing API account-insights call is outside the framework-native toolset. Tokens are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only and only calls the insights endpoint.
- The included heuristic is intentionally conservative; adapt thresholds for your account.
- It compares yesterday with the previous day. Save daily outputs externally if you want longer run history.
- Always review recommendations before changing live budgets, targeting, creative, or campaigns.
