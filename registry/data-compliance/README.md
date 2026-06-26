# Data Compliance Agent

## What it does

Plans a read-only scan for disallowed and personally identifiable (PII) data sitting in this project's production data stores, and drafts the preventive guards that stop it from recurring. Given a scope or policy description, the agent suggests the categories to check (direct identifiers, government identifiers, authentication secrets, free-text leakage, test data in production, and any domain-specific categories implied by the scope) plus the guards that prevent recurrence. It is draft-first and strictly read-only: it runs the drafted checks as read-only queries and reports matches as findings, and it never deletes, redacts, or modifies any data on its own.

The only custom tool is a small, network-free scan planner.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add data-compliance
```

Target overrides:

```bash
npx atom-eve add data-compliance --target eve
npx atom-eve add data-compliance --target flue
```

## Setup

No environment variables or external credentials are required. After install, edit the installed instructions and the daily schedule/workflow to point at the production data stores and the policy you want scanned.

- Eve installs as the root agent under `agent/`, including `agent/schedules/daily.ts`.
- Flue installs an agent plus `src/workflows/data-compliance-daily.ts`.

## Usage

Run the agent manually to draft a scan for a given scope, or wire the installed daily schedule/workflow into your deployment. The agent uses the planner tool to draft the checks for disallowed and PII data, runs them as read-only queries, reports matches as findings, and drafts the preventive guards. Review the findings and apply any remediation yourself, or add your own write tool.

You can describe a scope to tailor the checks:

```text
Plan a compliance scan for the production payments database.
```

## Connections and auth

This package has no connections and requires no credentials. The planner is pure and network-free; it neither reads a data store nor calls any API. Connecting to a store to run the drafted read-only checks is left to the operator or a read tool you add yourself.

## Limitations

- The planner is a pure, network-free draft tool. It suggests checks and guards; it does not connect to any data store and does not run the scan itself.
- It is strictly read-only by design. Deleting, redacting, or anonymizing flagged data is intentionally left to the operator or a write tool you add yourself.
- Always review the drafted checks and any findings before acting on real production data.
