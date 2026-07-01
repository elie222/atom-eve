---
name: author-atom-eve-agent
description: Use when authoring or contributing a NEW Atom Eve agent to the registry (not installing an existing one) - designing what it does, wiring its capability and connections, and writing instructions.md, atom.json, and the README. Triggers include "build a new Atom Eve agent", "contribute an agent", "add a new agent to the registry", "author an Atom Eve agent". To install an existing agent, use install-atom-eve-agent instead.
---

# Author an Atom Eve agent

Atom Eve is an open registry of installable AI agents, like shadcn but for agents. Authoring one
means adding a folder under `registry/<agent>/` in the `elie222/atom-eve` repo and opening a PR. This
skill is the entry point; the full reference is the repo's `AGENTS.md`, and the README has its own
skill, `agent-readme`.

## Get into the repo

You author inside the repo, next to the example agents and the generator that validates them.

- Not in the repo yet: fork and clone it (`gh repo fork elie222/atom-eve --clone`, or clone your
  fork), then `pnpm install`.
- Already in it: work in `registry/<agent>/`.

Start from the closest existing agent (browse `registry/`) rather than a blank folder.

## What earns being an agent

An agent must do work only an LLM can do: judgment, reasoning, writing. If removing the model leaves
roughly the same output, it is a script, not an agent. Tools, CLIs, and connections return raw
facts; the model does the reasoning and the writing. Never bake copy or decisions into tool code.

## The pattern (headlines; `AGENTS.md` has the detail)

- **Structure.** `registry/<agent>/` holds `atom.json`, `README.md`, and `agent/` (`instructions.md`
  plus optional `connections/`, `schedules/`, `sandbox/`, `tools/`, `skills/`). See "Source Layout".
- **Capability, in priority order:** a CLI in the sandbox + a usage skill > an eve connection
  (MCP/OpenAPI) > a custom tool. See "Giving an agent capability".
- **Be opinionated.** Wire every data source the agent needs and make them all required; name a
  **primary** (first-party ground truth) and a **secondary** (competitive / gap) rather than marking
  either optional. Only a stack-dependent write destination (a GitHub blog vs a CMS) is optional.
- **Config in one place.** What the operator sets (site, domain, repo, keywords) lives in
  `instructions.md`; the schedule's prompt stays generic and refers to "the configured X".
- **`instructions.md` is addressed to the agent** in the second person. No credentials, no
  marketing tone, no "edit this after install".
- **README: use the `agent-readme` skill.** Value-led "What it does", skimmable, one standard Setup.

## Verify

Run `pnpm check`. For install-sensitive changes, also run the clean install flow in `AGENTS.md`
("Verification"). Then open a PR against `elie222/atom-eve`.
