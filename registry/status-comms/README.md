# Status Comms Agent

## What it does

Turns the incident details you provide into two operator-ready drafts: a customer-facing status update tailored to the incident's lifecycle stage (investigating, identified, monitoring, resolved) and a structured post-mortem outline. It recommends an update cadence based on severity and grounds the wording in the title, impact, affected services, and start time you pass in.

It is draft-first and read-only. The only tool is a small, network-free planner that scaffolds the update and outline; the agent then refines the customer-facing copy. Nothing is posted to a status page, sent to customers, or published to chat. Wiring an approved draft to a real channel is left to you or a write tool you add.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add status-comms
```

Target overrides:

```bash
npx atom-eve add status-comms --target eve
npx atom-eve add status-comms --target flue
```

## Setup

No environment variables or external accounts are required. The planner runs entirely offline.

Edit `instructions.md` after install so the drafts match your project's voice, status page, and audience. Provide the incident details in the prompt: title, severity (critical, major, minor), lifecycle stage, customer impact, affected services, and start time.

## Usage

Run the agent on demand when an incident is declared or when its status changes. There is no schedule or workflow; you invoke it as needed.

Pass the incident details in the prompt, for example:

> Draft a status update for a major incident: elevated API error rates, status identified, affecting Checkout and Webhooks, started 14:05 UTC.

The agent calls `draft_incident_update` to scaffold the customer-facing update and the post-mortem outline, then refines the copy and presents both as drafts for your approval.

## Connections and auth

None. This agent declares no connections and reads no secrets. The `fetch` integration tag reflects the framework's native capability only; the planner makes no network calls.

## Limitations

- The planner is pure and network-free. It scaffolds copy and an outline; it does not read from or post to any status-page, email, or chat API.
- Drafts are only as accurate as the incident details you provide. Always review for accuracy and tone before publishing.
- Posting status updates, sending customer email, and publishing post-mortems are intentionally left to the operator or a write tool you add yourself.
