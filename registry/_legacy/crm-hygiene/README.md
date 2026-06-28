# CRM Hygiene Agent

## What it does

Scans your HubSpot contacts and returns a cleanup report covering three data-quality issues: duplicate records, contacts missing required fields, and stale contacts with no recent activity. The report is grouped by issue and prioritized so an operator can approve and act on it.

The agent uses framework-native agent, schedule, and workflow files. The only custom tool is the small HubSpot CRM reader needed to fetch contacts.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add crm-hygiene
```

Target overrides:

```bash
npx atom-eve add crm-hygiene --target eve
npx atom-eve add crm-hygiene --target flue
```

## Setup

Create a HubSpot private app (or use an existing one) with the `crm.objects.contacts.read` scope, then copy its access token. Do not grant write scopes unless you intentionally add your own write tools later.

Required environment variables:

```bash
HUBSPOT_ACCESS_TOKEN=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to scan recent contacts, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (cron `0 9 * * *`).
- Flue installs an agent plus `src/workflows/crm-hygiene-daily.ts`.

The agent reads a page of HubSpot contacts, detects duplicates by email and name, flags contacts missing required fields, and flags contacts that have not been modified within the stale-day threshold. It returns suggested cleanup tasks and does not mutate any record.

For lightweight run history, save the daily report somewhere your operator can review, such as `runs/crm-hygiene/YYYY-MM-DD.md` or a team ticket. Including prior reports in the next prompt lets the agent note whether the cleanup queue is shrinking without needing a database.

Local smoke test with a mocked HubSpot response:

```bash
HUBSPOT_ACCESS_TOKEN=test pnpm dlx tsx -e '
import { fetchContacts, findDuplicates, findMissingFields } from "./agent/lib/hubspot.ts";
const payload = { results: [
  { id: "1", properties: { email: "a@example.com", firstname: "Ada", lastname: "Lovelace", phone: "" } },
  { id: "2", properties: { email: "a@example.com", firstname: "Ada", lastname: "Lovelace", phone: "555" } }
] };
const fetchMock = async () => new Response(JSON.stringify(payload));
void (async () => {
  const contacts = await fetchContacts(100, fetchMock as typeof fetch);
  console.log(JSON.stringify({ duplicates: findDuplicates(contacts), missing: findMissingFields(contacts, ["email", "firstName", "lastName", "phone"]) }, null, 2));
})();
'
```

Run the smoke test from an installed Eve app folder after `npx atom-eve add crm-hygiene --target eve`. For Flue, change the import path to `./src/lib/agents/crm-hygiene/hubspot.ts`.

## Connections and auth

This package uses a custom HubSpot tool with env-token auth because the HubSpot CRM contacts read call is outside the framework-native toolset. The token is read by the installed project at runtime via `HUBSPOT_ACCESS_TOKEN`.

## Limitations

- The reference implementation is read-only and only calls the contacts read endpoint.
- It scans a single page of contacts (up to 100) per run and does not paginate or read the deals/companies objects; adapt the tool if you need full-database scans or deal hygiene.
- Duplicate detection is a conservative heuristic based on matching email or first/last name; review every proposed merge before acting.
- Stale detection uses HubSpot's `lastmodifieddate`, which is a proxy for activity, not a guarantee of disengagement.
- Always review recommendations before merging, editing, deleting, or archiving live records.
