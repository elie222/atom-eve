# Loops Email Agent

## What it does

Reviews the project's [Loops](https://loops.so) mailing lists and drafts lifecycle and broadcast emails grounded in recent business context. It is draft-first: every email comes back as an operator-ready draft with a subject line and target list, and the agent does not send anything on its own.

Email strategy and copy quality come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `copywriting` skill, which the installer pulls from skills.sh at install time. The only custom tool is a small Loops API reader.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add email-loops
```

Target overrides:

```bash
npx atom-eve add email-loops --target eve
npx atom-eve add email-loops --target flue
```

## Setup

Create a Loops API key from your Loops workspace settings with read access to your mailing lists.

Required environment variables:

```bash
LOOPS_API_KEY=...
```

Configure this variable in your local shell and in the deployment environment that runs the Eve schedule or Flue workflow.

The installer also pulls the shared `coreyhaines31/marketingskills@copywriting` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@copywriting
```

## Usage

Run the agent manually to review the audience and draft this week's email, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts`.
- Flue installs an agent plus `src/workflows/email-loops-weekly.ts`.

The agent reads your mailing lists, then uses the copywriting skill to draft the next lifecycle or broadcast email. Review and send approved drafts from Loops yourself, or add your own write tool.

## Connections and auth

This package uses a custom Loops tool with env-token auth because the Loops list endpoint is outside the framework-native toolset. The API key is read by the installed project at runtime.

## Limitations

- The reference implementation is read-only and only lists mailing lists; it does not send email or read campaign analytics.
- Sending broadcasts, triggering events, and transactional sends are intentionally left to the operator or a write tool you add yourself.
- Always review drafted copy and the target list before sending to real subscribers.
