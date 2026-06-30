---
name: agent-readme
description: Write or deslopify a registry agent's README (`registry/<agent>/README.md`). Use when authoring a new agent README, trimming an existing one, or cutting AI-generated README noise ("these READMEs are too long / generic / repetitive", "deslopify the readmes", "fix the <agent> README"). Not for `agent/instructions.md`, the runtime prompt.
---

# Agent READMEs

A README is the human's **install decision**: what this agent does for me, and what I must set up. It is not the agent's prompt (`instructions.md`, addressed to the agent). It carries only what is **unique to this agent**. Everything **derivable** the catalog page already renders, so repeating it is the slop to cut.

## Shape

The one-line outcome lives once in the agent's `atom.json` `description` (the catalog page renders it at the top, and it also feeds cards and SEO), so the README never repeats it. The README itself is an H1 and two sections, no lead paragraph:

```md
# <Title>

## What it does

<the concrete checks or actions, and what you get back>

## Setup

<what you must provide to run it: the config to set, the scope of a key to get. Omit the section if there is genuinely nothing.>
```

The generator requires `What it does` and `Setup`. Write the `atom.json` `description` as the single outcome sentence, led by the result, not the mechanism, framework, or backend.

## The page already shows it, so the README never does

The catalog page renders from `atom.json` and source: the install box (install commands), the sidebar (Integrations, Required Env, Frameworks, Version, Scheduled, Source), and a CODE tab (the real channel and tool source). A README that repeats any of these is duplication. So it has **no** Install, Supported targets, Connections/auth, env list (including a "no keys needed" line), or Limitations section. These were force-required historically, which is why old READMEs still carry them. Name a credential only to add what the sidebar cannot: the *scope* of a key, or which service to connect. Don't restate the env var names themselves; the Required Env sidebar already lists them.

## How it runs is structure, not prose

Every agent runs one of two ways, both install choices the page surfaces, never spelled out per README:

- **Scheduled**: on by default; it is the agent's nature.
- **Slack**: off by default; two distinct meanings, *trigger from Slack* (inbound) and *updates to Slack* (outbound).

Never write "run on demand", "`npx eve dev`", or "mention it in Slack" in a README. `eve dev` is generic dev boilerplate documented once globally; the rest is the page's job.

## Write only what is true and unique

- **Don't append "Agent" to the H1** unless it is a proper name. (The outcome sentence is the `atom.json` `description`, not a README lead.)
- **Don't document a capability the agent lacks.** If you can't point to the mechanism in the agent's source, cut the line. (A phantom "supply your own browser session" for an agent whose instructions forbid bypassing auth is pure filler.)
- **A boundary line only for a write-capable agent**, stating the limit it holds (fills forms but never submits payment). Never reassure that a read-only agent is read-only.
- **No em dashes** in prose; use commas, colons, or separate sentences.

## Deslopifying an existing README

1. Delete Install, Supported targets, Connections/auth, Limitations, and any env list or "no keys needed" line.
2. Delete how-to-run / Usage prose: schedule cadence, `eve dev`, Slack mentions.
3. Delete the README lead paragraph. The outcome belongs in `atom.json` `description`; make sure that description is outcome-led, not "A browser-driven agent that...".
4. Collapse what remains into What it does and Setup.
5. Cut any line describing a capability you cannot find in the source.
6. Strip em dashes.

## Example

A scheduled, read-only agent with no channel, the common shape. The outcome sentence is the `atom.json` `description`:

```jsonc
// atom.json
"description": "Get a prioritized, fix-it-today report of the SEO and content problems on your site.",
```

```md
# SEO Audit

## What it does

Opens your site or a sitemap sample in a real browser and checks titles, meta descriptions, headings, canonical and robots signals, broken content, weak CTAs, content gaps, and internal-link opportunities. You get a Markdown report with the findings ordered by severity, each with a concrete fix.

## Setup

Set the site it audits in `agent/schedules/weekly.ts`, and tune `agent/instructions.md` for your product and conversion goals.
```
