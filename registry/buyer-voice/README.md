# Buyer Voice Agent

## What it does

Mines repeated buyer objections from notes you provide (sales call notes, support tickets, churn surveys, reviews) and drafts landing-page copy that answers those objections in customers' own words. It is draft-first: it clusters the objections by theme, then returns copy drafts (headline, subhead, body, CTA, FAQ) for operator approval. The agent does not edit or publish any page.

Objection clustering comes from a small, network-free planner tool. Voice and persuasion come from a shared remote skill rather than copy-pasted prompt text: this agent declares the Corey Haines `copywriting` skill, which the installer pulls from skills.sh at install time.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add buyer-voice
```

Target overrides:

```bash
npx atom-eve add buyer-voice --target eve
npx atom-eve add buyer-voice --target flue
```

## Setup

No environment variables are required. The planner tool is pure and runs offline.

The installer also pulls the shared `coreyhaines31/marketingskills@copywriting` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@copywriting
```

## Usage

This agent is on-demand: there is no schedule or workflow. Run it whenever you have a batch of customer notes.

Paste in the objections you have heard (as a list, or as raw call/ticket notes) and optionally the page or product you are writing for. The `draft_copy` tool clusters the objections by theme with frequency counts and returns copy-draft scaffolds for each theme. The agent then uses the copywriting skill to rewrite the copy in the customers' own language. Review and ship the approved copy yourself.

- Eve installs as the root agent under `agent/`, with `agent/tools/draft_copy.ts`.
- Flue installs an agent plus `src/tools/buyer-voice/voice.ts`.

## Connections and auth

None. The agent ships only a pure planner tool that needs no API keys or network access. The `fetch` integration is declared so you can add your own tools (for example, pulling tickets from a help desk) later without changing the manifest shape.

## Limitations

- The planner is pure and network-free: it only organizes the notes you paste in. It does not connect to a CRM, help desk, or call-recording tool to read objections for you.
- Clustering is keyword-based, so review the themes and reassign any objection it misfiles.
- It does not edit or publish landing pages and does not run A/B tests. Always review the drafted copy before shipping it to live traffic.
