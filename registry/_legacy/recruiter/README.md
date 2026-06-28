# Recruiter Agent

## What it does

Reviews new applicants from your [Ashby](https://www.ashbyhq.com) pipeline, scores them against a target role, shortlists the strongest matches, and drafts personalized outreach for operator approval. It is draft-first: the agent reads candidate data, returns a ranked shortlist with a short rationale per candidate, and presents outreach as drafts. It does not change candidate status or send anything on its own. The only custom tool is a small Ashby candidate reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add recruiter
```

Target overrides:

```bash
npx atom-eve add recruiter --target eve
npx atom-eve add recruiter --target flue
```

## Setup

Create an Ashby API key from your Ashby workspace settings (Admin -> API keys) with read access to candidates.

Required environment variables:

```bash
ASHBY_API_KEY=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

## Usage

Run the agent manually to review the latest applicants and draft outreach for a role, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts` (runs at `0 9 * * *`).
- Flue installs an agent plus `src/workflows/recruiter-daily.ts`.

The agent reads recent applicants, scores them against the role context you supply (must-have skills, seniority, location), shortlists the strongest, and drafts outreach. Review and send approved drafts from Ashby yourself, or add your own write tool.

## Connections and auth

This package uses a custom Ashby tool with env-token auth because the Ashby candidate endpoint is outside the framework-native toolset. Ashby uses HTTP Basic auth with the API key as the username and an empty password; the `ASHBY_API_KEY` is read by the installed project at runtime.

## Limitations

- The reference implementation is read-only and only lists candidates; it does not move candidates between stages, change status, or send messages.
- Scoring and shortlisting are produced by the agent from the role context you provide; supply clear must-have criteria for best results.
- Always review the shortlist rationale and drafted outreach before contacting real candidates.
