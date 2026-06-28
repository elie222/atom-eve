# Userlist Email Agent

## What it does

Plans lifecycle, event-driven email campaigns for [Userlist](https://userlist.com) and drafts the message copy grounded in recent business context. Userlist campaigns are triggered by events and segments rather than ad-hoc broadcasts, so the agent suggests the events and traits to push for a given lifecycle stage, then drafts the message copy for each one. It is draft-first: every email comes back as an operator-ready draft with a subject line and the event that should trigger it, and the agent does not push anything to Userlist on its own.

Email strategy and copy quality come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `copywriting` skill, which the installer pulls from skills.sh at install time. The only custom tool is a small, network-free campaign planner.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add email-userlist
```

Target overrides:

```bash
npx atom-eve add email-userlist --target eve
npx atom-eve add email-userlist --target flue
```

## Setup

Create a Userlist Push API key from your Userlist account settings. The agent reads it to confirm credentials are configured; a write tool you add later would use it to push events and traits.

Required environment variables:

```bash
USERLIST_PUSH_KEY=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

The installer also pulls the shared `coreyhaines31/marketingskills@copywriting` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@copywriting
```

## Usage

Run the agent manually to plan a lifecycle stage and draft this week's email, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts`.
- Flue installs an agent plus `src/workflows/email-userlist-weekly.ts`.

The agent plans the events and traits that should trigger messages for the chosen lifecycle stage, then uses the copywriting skill to draft the message copy for each event. Push the approved events and traits to Userlist yourself, or add your own write tool.

## Connections and auth

This package uses a custom Userlist tool with env-token auth because Userlist's Push API (`https://api.userlist.com`, authenticated with `Authorization: Push ${USERLIST_PUSH_KEY}`) is event/push-oriented and is outside the framework-native toolset. The push key is read by the installed project at runtime to confirm credentials are configured.

## Limitations

- The Userlist Push API is event/push-oriented and does not offer a clean "list audiences" read endpoint like Loops or Resend, so the reference tool is a pure, network-free planner. It suggests events + traits and drafts copy; it does not call Userlist.
- Pushing events, setting traits, and triggering campaigns are intentionally left to the operator or a write tool you add yourself.
- Always review the planned events and drafted copy before pushing anything to real subscribers.
