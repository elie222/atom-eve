# Lead Router Agent

## What it does

Reads recent inbound HubSpot contacts, scores each lead by ICP fit (company, seniority, business email, region) and intent (lifecycle stage, conversion events, page views), and drafts an owner assignment and first-touch outreach message for an operator to approve.

The agent uses framework-native agent, schedule, and workflow files. The only custom tool is the small HubSpot CRM reader needed to fetch recent contacts. It is read-only: it never assigns owners, changes lifecycle stages, writes properties, or sends outreach.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add lead-router
```

Target overrides:

```bash
npx atom-eve add lead-router --target eve
npx atom-eve add lead-router --target flue
```

## Setup

Create a HubSpot private app with read access to CRM contacts (the `crm.objects.contacts.read` scope is sufficient). Do not grant write scopes unless you intentionally add your own write tools later. Copy the private app access token.

Required environment variables:

```bash
HUBSPOT_ACCESS_TOKEN=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review recent inbound contacts, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (cron `0 9 * * *`).
- Flue installs an agent plus `src/workflows/lead-router-daily.ts`.

The agent reads recent contacts, scores them by ICP fit and intent, sorts by score, and returns a draft owner assignment and first-touch message per lead. It does not modify HubSpot.

For lightweight run history, save the daily response somewhere your operator can review, such as `runs/lead-router/YYYY-MM-DD.md` or a team ticket/comment.

Local smoke test with a mocked HubSpot response:

```bash
HUBSPOT_ACCESS_TOKEN=test pnpm dlx tsx -e '
import { fetchRecentContacts, routeLead } from "./agent/lib/hubspot.ts";
const payload = { results: [
  { id: "1", properties: { email: "ceo@acme.com", firstname: "Dana", lastname: "Lee", company: "Acme", jobtitle: "Founder", lifecyclestage: "salesqualifiedlead", num_conversion_events: "3", hs_analytics_num_page_views: "12" } }
] };
const fetchMock = async () => new Response(JSON.stringify(payload));
void (async () => {
  const contacts = await fetchRecentContacts(25, fetchMock as typeof fetch);
  console.log(JSON.stringify(contacts.map(routeLead), null, 2));
})();
'
```

Run the smoke test from an installed Eve app folder after `npx atom-eve add lead-router --target eve`. For Flue, change the import path to `./src/lib/agents/lead-router/hubspot.ts`.

## Connections and auth

This package uses a custom HubSpot tool with env-token auth because the HubSpot CRM contacts read call is outside the framework-native toolset. The token is read by the installed project at runtime via `HUBSPOT_ACCESS_TOKEN`.

## Limitations

- The reference implementation is read-only and only calls the contacts read endpoint.
- The included ICP/intent scoring heuristic is intentionally simple; adapt thresholds, properties, and tiers for your funnel.
- Owner assignment and first-touch messages are drafts only; nothing is written to HubSpot.
- It reads a recent slice of contacts (default 25, max 100). Save daily outputs externally if you want longer run history.
- Always review the scores, routing, and drafted outreach before assigning owners or contacting leads.
