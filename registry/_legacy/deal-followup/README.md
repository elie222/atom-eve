# Deal Follow-up Agent

## What it does

Turns a sales-call transcript into a ready-to-edit follow-up package: a recap email, a list of extracted next steps with owners, and draft CRM field updates (budget, timeline, decision makers, pain points, use case, competitors, next meeting). It is draft-first and read-only. You paste the transcript into the prompt; the agent parses it, drafts the recap email grounded in the prospect's own words, and presents the next steps and CRM updates for your approval. It does not send email or write to any CRM on its own.

The only custom tool is a small, network-free planner that parses the transcript into candidate next steps, CRM field signals, and a recap-email scaffold. The agent writes the prose; the operator approves and sends.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add deal-followup
```

Target overrides:

```bash
npx atom-eve add deal-followup --target eve
npx atom-eve add deal-followup --target flue
```

## Setup

No environment variables or external credentials are required. The planner runs entirely offline against the transcript text you provide.

## Usage

This agent is on-demand. Run it whenever a call wraps up and paste the transcript into the prompt, for example:

> Turn this sales-call transcript into a follow-up: <paste transcript>

The agent runs the `plan_followup` tool on the transcript to extract candidate next steps, CRM field signals, and a recap-email scaffold, then drafts the recap email and presents the next steps and suggested CRM field updates for your review. Approve, edit, and send the email yourself, and apply the CRM updates yourself or wire in your own write tool.

- Eve installs as the root agent under `agent/`, including the `plan_followup` tool under `agent/tools/`.
- Flue installs an agent plus the planner tool under `src/tools/deal-followup/`.

## Connections and auth

This package has no connections and no auth. The custom `plan_followup` tool is a pure, network-free planner that only parses the transcript string passed to it, so there are no API keys or tokens to configure.

## Limitations

- The planner uses lightweight text heuristics to surface candidate next steps and CRM signals; it can miss items or flag false positives, so always review the extracted output against the transcript.
- It does not transcribe audio. Provide an existing text transcript.
- It is read-only: it never sends the recap email and never writes to a CRM. Sending and CRM updates are intentionally left to the operator or a write tool you add yourself.
- Always review the drafted email, owners, and field values before sending or saving anything to real records.
