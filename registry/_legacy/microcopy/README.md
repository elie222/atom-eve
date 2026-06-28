# Microcopy Agent

## What it does

Rewrites the in-product copy you paste in — buttons, empty states, error messages, tooltips, labels, and onboarding text — for clarity and a consistent brand voice. It is draft-first: it flags the clarity and voice problems in each string (length, jargon, vague CTAs, passive voice, shouty tone, missing next step or recovery guidance), gives each string a rewrite goal, and returns a voice checklist. The agent then drafts a rewrite for every string and shows it beside the original. It does not edit any product copy.

Copy analysis comes from a small, network-free planner tool. The agent fills in the actual rewrites and presents every one as a draft for operator approval.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add microcopy
```

Target overrides:

```bash
npx atom-eve add microcopy --target eve
npx atom-eve add microcopy --target flue
```

## Setup

No environment variables are required. The planner tool is pure and runs offline.

## Usage

This agent is on-demand: there is no schedule or workflow. Run it whenever you want to tighten a screen's copy.

Paste in the exact strings you want rewritten (preferred) or a screen description, and optionally the `copyType` (`button`, `empty-state`, `error`, `tooltip`, `onboarding`, `label`, or `general`) and the brand `voice`. The `improve_copy` tool flags the clarity and voice issues per string and returns a rewrite goal plus a voice checklist. The agent then writes concrete rewrites, fixing the flagged issues first and showing each original next to its rewrite. Apply the approved copy yourself.

- Eve installs as the root agent under `agent/`, with `agent/tools/improve_copy.ts`.
- Flue installs an agent plus `src/tools/microcopy/microcopy.ts`.

## Connections and auth

None. The agent ships only a pure planner tool that needs no API keys or network access. The `fetch` integration is declared so you can add your own tools (for example, pulling strings from a localization service) later without changing the manifest shape.

## Limitations

- The planner is pure and network-free: it only analyzes the strings or description you paste in. It does not read your codebase, scan a design system or style guide, or apply changes.
- Issue detection is heuristic (regex-based), so it can miss subtle voice problems or over-flag valid copy. Treat the flags as prompts, not verdicts.
- It does not edit product copy or open PRs. Always review the drafted rewrites against your real product context and voice before shipping them.
