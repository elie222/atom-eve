# Backup Verifier Agent

## What it does

Drafts clean-room restore-and-verify plans for your backups and reports gaps in backup coverage. A clean-room restore means restoring into an isolated environment with no access to production, then proving the restored data is complete and usable. For each required recovery scenario, the agent outlines the restore steps, the verification checks that confirm recovery point and integrity, and any missing safeguards (offsite copy, immutability, encryption, retention, monitoring, RTO/RPO targets).

It is read-only and draft-first: every plan and gap comes back for operator review. The agent never restores, deletes, or modifies any backup, snapshot, or system, and it never claims a restore succeeded. The only custom tool is a small, network-free planner.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add backup-verifier
```

Target overrides:

```bash
npx atom-eve add backup-verifier --target eve
npx atom-eve add backup-verifier --target flue
```

## Setup

No credentials or environment variables are required. Describe your backup setup in the prompt or local config notes: what is backed up, where it is stored, how often, retention, and any encryption / offsite / immutability details. The agent uses that description to draft the clean-room scenarios and detect gaps.

## Usage

Run the agent manually to draft a restore-and-verify plan, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (cron `0 9 * * 1`).
- Flue installs an agent plus `src/workflows/backup-verifier-weekly.ts`.

The agent calls the `plan_restore_check` tool to draft clean-room restore steps and verification checks for each recovery scenario, then reports any coverage gaps. Run the restore tests and remediate gaps yourself; the agent only plans and reports.

## Connections and auth

None. This agent has no connections and reads no external service. The `fetch` integration is declared as a capability tag only; the reference tool is a pure, network-free planner that drafts steps from the backup description you provide.

## Limitations

- The planner is network-free: it does not connect to your backup provider, list snapshots, or read real backup metadata. It plans and reports from the description you give it.
- Gap detection is keyword-based over your description, so an incomplete description yields incomplete gap findings. Describe the setup fully for the best results.
- Running restores, restoring into a clean room, and remediating gaps are intentionally left to the operator. Always verify recoverability with a real restore test.
