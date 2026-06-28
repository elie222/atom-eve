# Research Assistant Agent

## What it does

The Research Assistant Agent turns a single focused question into a sourced, cited brief you can act on for a real decision. Instead of a wall of text, it returns a bottom-line answer up front, the load-bearing findings (each grounded in a cited URL), where sources disagree and how it resolved the conflict, and an honest read on confidence and what it could not verify.

It uses the target framework's native web search and fetch capability to find and read sources. There is no custom research tool and no paid search or market-intelligence API. The agent is read-only and on-demand: it gathers, verifies, and synthesizes, but it does not act on the decision, send anything, or change any system.

Verification is adversarial by design. For each material claim the agent confirms it against the source it cites and looks for a source that disagrees or qualifies it, notes publication dates and possible staleness, and flags anything it could only find in a single low-quality source.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add research-assistant --target flue
```

or:

```bash
npx atom-eve add research-assistant --target eve
```

## Setup

No API keys or environment variables are required. The agent relies on the host framework's native web search and fetch (or sandbox command execution).

After install, edit the agent's instructions to reflect the kinds of questions, sources, and decisions your project cares about. Confirm that web search and fetch are enabled in your deployment so the agent can read live sources; if they are unavailable it will say so rather than answering from memory.

## Usage

This agent is on-demand. Ask it a focused question and state the decision it informs. For example:

```text
Research this question and write a sourced brief: should we adopt Postgres logical replication or a CDC tool for streaming our orders table to the warehouse?

Decision: we are choosing an approach this quarter for a ~50GB table with low-latency needs.
Use native web search and fetch, prefer primary sources, verify claims, and note dates.
```

The agent will:

1. Restate the question and decision and any assumptions it is making.
2. Plan a few distinct sub-questions and search broad, then narrow.
3. Gather sources with native web search and fetch, preferring primary and authoritative ones.
4. Verify each material claim against its source and against a disagreeing source, noting dates.
5. Synthesize a concise Markdown brief with: Question and decision, Bottom line, Key findings, Evidence and disagreement, Confidence and gaps, Sources (numbered URLs), and Recommended next steps.

If the question is underspecified, the agent states its assumptions and calls out what would change the answer rather than guessing silently.

## Connections and auth

This package has no external service connection and no required environment variables. It uses only the framework's native web and fetch capability, so there is nothing to authenticate in this registry package.

## Limitations

- The agent only knows what it can read from live sources at run time; web search and fetch must be available in the host framework, and it does not use paid search or market-intelligence APIs.
- It is read-only and on-demand. It does not act on the decision, monitor topics over time, or store results between runs. Durable research memory and scheduled monitoring are future host-app work.
- Source quality and recency vary. The agent flags staleness and single-source claims, but you should review the cited sources before making an important decision.
- It cannot read paywalled, login-gated, or robots-blocked pages; it will record the blocker and continue with what it can reach.
