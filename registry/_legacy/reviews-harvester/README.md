# Reviews Harvester Agent

## What it does

Watches the new product reviews from the source you configure (for example a [G2](https://g2.com), [Trustpilot](https://trustpilot.com), or [Capterra](https://capterra.com) feed, export, or pasted text), classifies each review's sentiment, drafts an on-brand reply, and flags detractors for follow-up. It is draft-first: every reply comes back as an operator-ready draft tied to the review it answers and the platform it belongs to, and the agent does not post anything on its own.

Response tone and copy quality come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `copywriting` skill, which the installer pulls from skills.sh at install time. The only custom tool is a small, network-free review-response planner.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add reviews-harvester
```

Target overrides:

```bash
npx atom-eve add reviews-harvester --target eve
npx atom-eve add reviews-harvester --target flue
```

## Setup

No environment variables are required.

The agent does not fetch reviews itself, because review platforms vary by provider and most read paths sit behind authenticated, non-standard endpoints. Wire your own review source: a saved G2/Trustpilot/Capterra-style feed, an export, or review text you paste in, and pass each new review to the `draft_responses` tool in the `reviews` array, each with its `text` and optional `rating`, `author`, and `source`.

The installer also pulls the shared `coreyhaines31/marketingskills@copywriting` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@copywriting
```

## Usage

Run the agent manually against a batch of new reviews, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts`.
- Flue installs an agent plus `src/workflows/reviews-harvester-weekly.ts`.

For each batch, the agent uses the `draft_responses` tool to classify sentiment and flag detractors, then uses the copywriting skill to draft a reply per review. Review the approved drafts and post them to the platform yourself, or add your own write tool.

## Connections and auth

This package uses no external connections or credentials. The `draft_responses` tool is a pure, network-free planner: it takes the reviews you pass in and returns per-review sentiment, a detractor flag, and a response checklist. It does not call any review platform or post anything.

## Limitations

- The `draft_responses` tool is a pure, network-free planner. Review platforms (G2, Trustpilot, Capterra, app stores) vary by provider and lack a single clean read endpoint, so the operator wires the review source and passes each review in as `reviews`; the tool does not fetch reviews.
- Sentiment classification uses the star rating when present and a simple keyword heuristic otherwise. It is a triage starting point, not a substitute for operator judgement.
- Posting replies, reporting reviews, and tracking responses are intentionally left to the operator or a write tool you add yourself.
- Always review the drafted reply before posting it to a real review platform.
