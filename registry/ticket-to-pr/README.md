# Ticket to PR Agent

## What it does

Reads a [Linear](https://linear.app) ticket and drafts a reviewer-ready pull request plan: a reproduction or root-cause hypothesis, a step-by-step implementation plan that names the files and modules likely involved, and a test plan covering the acceptance criteria.

It is draft-first and read-only. The only custom tool is a small Linear GraphQL reader; the agent never opens, pushes, or merges a PR and never edits the ticket. Every plan comes back as a draft for operator approval.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add ticket-to-pr
```

Target overrides:

```bash
npx atom-eve add ticket-to-pr --target eve
npx atom-eve add ticket-to-pr --target flue
```

## Setup

Create a Linear API key from your Linear workspace settings (Settings → API → Personal API keys) with read access to your issues.

Required environment variables:

```bash
LINEAR_API_KEY=...
```

Configure this variable in your local shell and in the deployment environment that runs the agent.

## Usage

This agent is on-demand. Run it and pass a Linear ticket id or identifier (for example a UUID or a key like `ENG-123`). The agent reads the ticket via its review tool, then drafts the reproduction, implementation plan, and test plan for you to review before you open a PR yourself.

- Eve installs as the root agent under `agent/`, with the `review_ticket` tool.
- Flue installs an agent under `src/agents/ticket-to-pr.ts` with the Linear review tool.

There is no schedule or workflow; trigger the agent yourself when you pick up a ticket.

## Connections and auth

This package uses a custom Linear tool with env-token auth because the Linear issue read is outside the framework-native toolset. The Linear personal API key is sent directly in the `Authorization` header and is read by the installed project at runtime.

## Limitations

- The reference implementation is read-only: it reads a single ticket and drafts a plan. It does not open, push, commit, or merge a PR, and it does not edit the Linear ticket.
- It reads ticket fields, comments, and labels; it does not crawl linked sub-issues, attachments, or related Git history.
- Plan quality depends on the detail in the ticket. Review every drafted plan and fill any gaps before implementing.
