# Instantly Outreach Agent

## What it does

Plans cold-email outreach for your project end to end, draft-first. On a recurring loop it pulls fresh ICP leads from [Apollo](https://apollo.io), dedupes them against prior runs, reviews recent [Instantly](https://instantly.ai) campaign performance (open, reply, and positive-reply rates), and drafts a cold-email campaign with a 3-4 step follow-up sequence. It is read-only: the lead list, the performance review, and every email come back as operator-ready drafts, and the agent never creates, launches, or schedules a campaign in Instantly and never contacts a lead.

Email strategy and copy quality come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `copywriting` skill, which the installer pulls from skills.sh at install time. The only custom tool is a read+plan reviewer that wraps the Apollo and Instantly read APIs.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add instantly-outreach
```

Target overrides:

```bash
npx atom-eve add instantly-outreach --target eve
npx atom-eve add instantly-outreach --target flue
```

## Setup

Create an Apollo API key with people-search access and an Instantly API key with analytics read access from each tool's settings.

Required environment variables:

```bash
APOLLO_API_KEY=...
INSTANTLY_API_KEY=...
```

Configure these variables in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

The installer also pulls the shared `coreyhaines31/marketingskills@copywriting` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@copywriting
```

## Usage

Run the agent manually to pull leads and draft a campaign, or wire the installed schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/loop.ts` (cron `0 9 */3 * *`, every 3 days).
- Flue installs an agent plus `src/workflows/instantly-outreach-loop.ts`.

Each run pulls fresh ICP leads from Apollo, reviews recent Instantly campaign performance, then uses the copywriting skill to draft a cold-email sequence modeled on the best-performing campaign. Review the drafts, then create and launch the approved campaign in Instantly yourself, or add your own write tool.

## Connections and auth

This package uses two custom tools with env-token auth because the Apollo and Instantly read endpoints are outside the framework-native toolset:

- Apollo people search at `https://api.apollo.io/v1` with an `X-Api-Key` header.
- Instantly campaign analytics at `https://api.instantly.ai/api/v2` with a `Bearer` token.

Both keys are read by the installed project at runtime.

## Limitations

- The reference implementation is read-only: it searches Apollo leads and reads Instantly analytics, and returns a draft plan. It does not enrich, save, or contact leads, and it does not create or launch campaigns.
- Lead dedupe runs within a single pull (by email, LinkedIn URL, then Apollo id). To avoid re-contacting people across campaigns, persist each run's lead list yourself; the tool surfaces a hint to do so.
- Creating campaigns, uploading leads, and sending email are intentionally left to the operator or a write tool you add yourself.
- Always review the lead list and drafted copy before launching to real prospects.
