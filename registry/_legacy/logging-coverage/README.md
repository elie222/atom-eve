# Logging Coverage Agent

## What it does

Reviews code or a critical-path description and finds where important paths lack logging, then drafts structured log statements to add. It focuses on the paths that most often go dark in production: service entry/exit, catch blocks and rejected promises, external dependency calls, auth decisions, money and state-changing transitions, and retry/fallback branches.

It is draft-first and read-only. The agent returns each suggestion as a draft with the location, a structured event name, and the fields to include, so you can adapt them to your logger and apply them yourself. The only custom tool is a pure, network-free planner: it scans the text you pass and drafts statements; it never reads files, edits code, or sends anything.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add logging-coverage
```

Target overrides:

```bash
npx atom-eve add logging-coverage --target eve
npx atom-eve add logging-coverage --target flue
```

## Setup

No environment variables or external credentials are required. After install, edit `shared/instructions.md` (Eve) or the prompt constant in `lib/agents/logging-coverage/prompts.ts` (Flue) to match your project's logger, event-naming convention, and redaction rules.

## Usage

Run the agent on demand and paste the code or critical-path description you want reviewed. There is no schedule or workflow; this agent runs when you ask it to.

The agent calls the `plan_logging` tool to scan the input, then presents the drafted structured log statements for your approval. Review each draft, rename events and fields to fit your logger and schema, and add them at the indicated locations yourself.

## Connections and auth

None. This agent has no connections and reads no credentials. The `plan_logging` tool is a pure, network-free planner that operates only on the text passed to it.

## Limitations

- The planner is heuristic and pattern-based. It flags common high-value paths from the supplied text; it does not parse the AST, follow imports, or read your repository.
- It only analyzes the code or description you pass in a single call. It does not crawl files or measure runtime log volume.
- It drafts log statements but never edits files, commits, or applies them. Applying the drafts, and ensuring no secrets or full PII are logged, is the operator's responsibility.
