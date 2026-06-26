# Google Ads Agent

## What it does

Reviews Google Ads campaign performance and proposes conservative budget, keyword, and negative-keyword follow-up for an operator to approve.

The agent uses framework-native agent, schedule, and workflow files. The only custom tool is the small Google Ads API reader needed to fetch recent campaign metrics.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add google-ads
```

Target overrides:

```bash
npx atom-eve add google-ads --target eve
npx atom-eve add google-ads --target flue
```

## Setup

Create a Google Cloud OAuth client (Web or Desktop) with access to the Google Ads API, apply for a Google Ads developer token, and authorize a refresh token for a user who can read the target account. Grant read access only; do not add campaign management tools unless you intentionally wire your own write tools later.

Required environment variables:

```bash
GOOGLE_ADS_DEVELOPER_TOKEN=...
GOOGLE_ADS_CLIENT_ID=...
GOOGLE_ADS_CLIENT_SECRET=...
GOOGLE_ADS_REFRESH_TOKEN=...
GOOGLE_ADS_CUSTOMER_ID=1234567890
```

`GOOGLE_ADS_CUSTOMER_ID` is the 10-digit account id; dashes are stripped automatically. Building a full interactive OAuth flow inside the agent is impractical, so the agent mints a short-lived bearer access token at runtime by exchanging the pre-authorized refresh token at `https://oauth2.googleapis.com/token`. Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent campaign performance, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts`.
- Flue installs an agent plus `src/workflows/google-ads-daily.ts`.

The agent reads yesterday's campaign metrics, compares them with the previous day, calculates spend/conversion/CPA movement, and returns suggested actions. It does not mutate campaigns, budgets, or keywords by default.

For lightweight run history, save the daily response somewhere your operator can review, such as `runs/google-ads/YYYY-MM-DD.md` or a team ticket/comment. If you include prior summaries in the next prompt or workflow context, the agent can mention broader trends without needing a database.

Local smoke test with mocked Google responses:

```bash
GOOGLE_ADS_DEVELOPER_TOKEN=test GOOGLE_ADS_CLIENT_ID=id GOOGLE_ADS_CLIENT_SECRET=secret GOOGLE_ADS_REFRESH_TOKEN=refresh GOOGLE_ADS_CUSTOMER_ID=1234567890 pnpm dlx tsx -e '
import { fetchCampaignInsights, recommendCampaignActions } from "./agent/lib/googleAds.ts";
const responses = [
  { access_token: "abc" },
  { results: [{ campaign: { id: "1", name: "Search - Brand" }, metrics: { costMicros: "120000000", conversions: 0 } }] },
  { results: [{ campaign: { id: "1", name: "Search - Brand" }, metrics: { costMicros: "80000000", conversions: 2 } }] }
];
const fetchMock = async () => new Response(JSON.stringify(responses.shift()));
void (async () => {
  const insights = await fetchCampaignInsights({ since: "2026-06-24", until: "2026-06-24" }, { since: "2026-06-23", until: "2026-06-23" }, fetchMock as typeof fetch);
  console.log(JSON.stringify({ insights, recommendations: recommendCampaignActions(insights) }, null, 2));
})();
'
```

Run the smoke test from an installed Eve app folder after `npx atom-eve add google-ads --target eve`. For Flue, change the import path to `./src/lib/agents/google-ads/googleAds.ts`.

## Connections and auth

This package uses a custom Google Ads tool with env-credential auth because the Google Ads API search call is outside the framework-native toolset. The refresh token is exchanged for a short-lived access token at runtime, and the developer token plus customer id are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only and only calls the OAuth token endpoint and the `googleAds:search` endpoint.
- Authentication relies on a pre-authorized refresh token. The agent does not perform the interactive OAuth consent flow; you must obtain the refresh token out of band.
- The included heuristic is intentionally conservative; adapt thresholds for your account.
- It compares yesterday with the previous day. Save daily outputs externally if you want longer run history.
- Always review recommendations before changing live budgets, keywords, negative keywords, or campaigns.
