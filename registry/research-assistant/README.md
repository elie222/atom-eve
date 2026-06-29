# Research Assistant Agent

A read-only research agent that turns a focused question into a sourced, cited brief.

## What it does

Turns a single focused question into a sourced, cited brief you can act on for a real decision. Instead of a wall of text, it returns a bottom-line answer up front, the load-bearing findings (each grounded in a cited URL), where sources disagree and how it resolved the conflict, and an honest read on confidence and what it could not verify.

It uses eve's built-in `web_search` and `web_fetch` tools to find and read sources. There is no custom research tool, no sandbox, and no paid search or market-intelligence API. The agent is read-only and on-demand: it gathers, verifies, and synthesizes, but it does not act on the decision, send anything, or change any system. Verification is adversarial by design: for each material claim it confirms the citing source and looks for a source that disagrees or qualifies it, notes publication dates, and flags single low-quality sources.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add research-assistant
```

This copies the agent into `agent/` in your eve app.

## Setup

No API keys or environment variables are required. The agent relies on eve's built-in `web_search` (provider-managed) and `web_fetch` tools, which ship with every agent.

After installing, customize `agent/instructions.md` to reflect the kinds of questions, sources, and decisions your project cares about. Confirm web search is enabled for your model provider in your deployment; if it is unavailable the agent will say so rather than answering from memory.

## Usage

This agent is on-demand. Ask it a focused question and state the decision it informs. For example:

```text
Research this question and write a sourced brief: should we adopt Postgres logical replication or a CDC tool for streaming our orders table to the warehouse?

Decision: we are choosing an approach this quarter for a ~50GB table with low-latency needs.
Prefer primary sources, verify claims, and note dates.
```

The agent restates the question and decision, plans a few distinct sub-questions, gathers sources with `web_search` and `web_fetch` preferring primary ones, verifies each material claim against its source and a disagreeing source, and synthesizes a concise Markdown brief (Question and decision, Bottom line, Key findings, Evidence and disagreement, Confidence and gaps, Sources, Recommended next steps). If the question is underspecified, it states its assumptions rather than guessing silently.

## Connections and auth

This agent has no external service connection and no required environment variables. It uses only eve's built-in web tools, so there is nothing to authenticate in this registry package.

## Limitations

- The agent only knows what it can read from live sources at run time; web search must be available from your model provider, and it does not use paid search or market-intelligence APIs.
- It is read-only and on-demand. It does not act on the decision, monitor topics over time, or store results between runs.
- Source quality and recency vary. The agent flags staleness and single-source claims, but you should review the cited sources before making an important decision.
- It cannot read paywalled, login-gated, or robots-blocked pages; it records the blocker and continues with what it can reach.
