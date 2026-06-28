# Test Writer Agent

## What it does

Analyzes code you paste in (or a plain-language module description), identifies the paths that look untested, and drafts meaningful test cases with concrete assertions. It is draft-first: it surfaces the detected functions, branch hotspots (if/else, switch, try/catch, throws, loops), and a list of untested paths, then returns test-case scaffolds covering happy paths, edge and boundary inputs, error and rejection paths, and branch logic. The agent does not write test files or run the suite.

Untested-path analysis comes from a small, network-free planner tool. The agent fills in the concrete inputs and expected outputs and presents every test as a draft for operator approval.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add test-writer
```

Target overrides:

```bash
npx atom-eve add test-writer --target eve
npx atom-eve add test-writer --target flue
```

## Setup

No environment variables are required. The planner tool is pure and runs offline.

## Usage

This agent is on-demand: there is no schedule or workflow. Run it whenever you want a test plan for a module.

Paste in the code you want covered (preferred) or a behavior description, and optionally the target test framework (defaults to `vitest`). The `plan_tests` tool detects functions and branch hotspots, lists the untested paths it found, and returns assertion scaffolds for each. The agent then writes out concrete test drafts, prioritizing the highest-risk paths first. Review and add the approved tests yourself.

- Eve installs as the root agent under `agent/`, with `agent/tools/plan_tests.ts`.
- Flue installs an agent plus `src/tools/test-writer/planner.ts`.

## Connections and auth

None. The agent ships only a pure planner tool that needs no API keys or network access. The `fetch` integration is declared so you can add your own tools (for example, pulling a file from a repo host) later without changing the manifest shape.

## Limitations

- The planner is pure and network-free: it only analyzes the code or description you paste in. It does not read your repository, resolve imports, run the test suite, or measure real coverage.
- Function and branch detection is heuristic (regex-based), so it can miss exotic syntax or over-count branches. Review the detected paths and adjust.
- It does not write or run tests. Always review the drafted cases and confirm the assertions against actual behavior before committing them.
