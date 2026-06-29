# Research Assistant Agent

A read-only research agent that turns a focused question into a sourced, cited brief.

## What it does

Turns a single focused question into a concise brief for a real decision. It leads with the bottom line, lists load-bearing findings with cited URLs, explains source disagreement, and states confidence and gaps.

It is read-only and on-demand: it gathers, verifies, and synthesizes, but does not act on the decision, send anything, or change any system.

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add research-assistant
```

This copies the agent into `agent/` in your eve app.

## Setup

No API keys or environment variables are required. The agent uses Eve's built-in `web_search` and `web_fetch` tools.

After installing, customize `agent/instructions.md` with the questions, source standards, and decisions your project cares about. Confirm web search is enabled for your model provider; if unavailable, the agent reports that blocker rather than answering from memory.

## Usage

Ask a focused question and state the decision it informs:

```text
Research this question and write a sourced brief: should we adopt Postgres logical replication or a CDC tool for streaming our orders table to the warehouse?

Decision: we are choosing an approach this quarter for a ~50GB table with low-latency needs.
Prefer primary sources, verify claims, and note dates.
```

The agent returns a Markdown brief with the question, bottom line, key findings, evidence and disagreement, confidence and gaps, sources, and recommended next steps.

## Connections and auth

This agent has no external service connection and no required environment variables. It uses only Eve's built-in web tools.

## Limitations

- Web search must be available from your model provider; the agent does not use paid search or market-intelligence APIs.
- It does not act on decisions, monitor topics, or store results between runs.
- Source quality and recency vary; review cited sources before making important decisions.
- It cannot read paywalled, login-gated, or robots-blocked pages and records those blockers.
