# PR Pitcher Agent

## What it does

Pulls relevant journalist source requests from the feed you configure (for example a [Connectively](https://connectively.us), [Featured](https://featured.com), or HARO-style query feed), matches each request to your expertise, and drafts quotable pitch responses grounded in defensible claims. It is draft-first: every pitch comes back as an operator-ready draft with its target publication, deadline, and the source request it answers, and the agent does not submit anything on its own.

Pitch strategy and copy quality come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `copywriting` skill, which the installer pulls from skills.sh at install time. The only custom tool is a small, network-free pitch planner.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add pr-pitcher
```

Target overrides:

```bash
npx atom-eve add pr-pitcher --target eve
npx atom-eve add pr-pitcher --target flue
```

## Setup

No environment variables are required.

The agent does not fetch source requests itself, because journalist request feeds vary by provider and many sit behind authenticated, non-standard endpoints. Wire your own request source: a saved Connectively/Featured/HARO-style feed, an export, or query text you paste in, and pass each request to the `draft_pitch` tool as `query`, along with your area of `expertise`.

The installer also pulls the shared `coreyhaines31/marketingskills@copywriting` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@copywriting
```

## Usage

Run the agent manually against a source request, or wire the installed daily schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts`.
- Flue installs an agent plus `src/workflows/pr-pitcher-daily.ts`.

For each request, the agent uses the `draft_pitch` tool to score how well it matches your expertise and to get a draft-first response checklist, then uses the copywriting skill to draft a quotable reply. Review the approved drafts and submit them to the journalist or feed yourself, or add your own write tool.

## Connections and auth

This package uses no external connections or credentials. The `draft_pitch` tool is a pure, network-free planner: it takes a request and your expertise and returns a match score plus a response checklist. It does not call any feed or send anything.

## Limitations

- The `draft_pitch` tool is a pure, network-free planner. Journalist request feeds vary by provider and lack a single clean read endpoint, so the operator wires the request source and passes each request in as `query`; the tool does not fetch requests.
- The match score is a simple keyword-overlap heuristic to triage relevance. It is a starting point, not a substitute for operator judgement.
- Submitting responses to a feed, emailing journalists, and tracking placements are intentionally left to the operator or a write tool you add yourself.
- Always review the drafted pitch and confirm the claims are accurate before submitting to a real journalist.
