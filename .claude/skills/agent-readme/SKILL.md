---
name: agent-readme
description: Write or deslopify a registry agent's README (`registry/<agent>/README.md`). Use when authoring a new agent README, trimming an existing one, or cutting AI-generated README noise ("these READMEs are too long / generic / repetitive", "deslopify the readmes", "fix the <agent> README"). Not for `agent/instructions.md`, the runtime prompt.
metadata:
  internal: true
---

# Agent READMEs

A README is the human's **install decision**: what this agent does for me, and what I must set up. It is not the agent's prompt (`instructions.md`, addressed to the agent). It carries only what is **unique to this agent**. Everything **derivable** the catalog page already renders, so repeating it is the slop to cut.

## The shape

The README is an H1 and exactly two sections, no lead paragraph:

```md
# <Title>

## What it does

<lead line: the outcome the agent delivers. Then the concrete actions as short bullets, and what you get back.>

## Setup

<one line per required credential/connection: its scope and which file to configure. Omit the section only if there is genuinely nothing.>
```

The generator requires both `## What it does` and `## Setup`. The one-line outcome also lives in the agent's `atom.json` `description` (the catalog page renders it at the top, and it feeds cards and SEO); write that description outcome-led, not led by the mechanism, framework, or backend. Don't append "Agent" to the H1 unless it is part of a proper name.

## Leave out anything the page already renders

The catalog page renders from `atom.json` and source: the install box (install commands), the sidebar (Integrations, Required Env, Frameworks, Version, Scheduled, Source), and a CODE tab (the real channel and tool source). A README that repeats any of these is duplication. So it has **no** Install, Supported targets, Connections/auth, env list (including a "no keys needed" line), or Limitations section. These were force-required historically, which is why old READMEs still carry them.

How the agent runs is structure the page already surfaces, never prose:

- **Scheduled**: on by default; it is the agent's nature.
- **Slack**: off by default; two distinct meanings, *trigger from Slack* (inbound) and *updates to Slack* (outbound).

Never write "run on demand", "`npx eve dev`", or "mention it in Slack". `eve dev` is generic dev boilerplate documented once globally; the rest is the page's job.

## Writing "What it does"

Lead with the **outcome**, not the mechanism. "Improves your search rankings, week over week." not "Runs a loop every week." A loop, a browser pass, a report are all *how*; the reader wants *what it does for me* first. Same rule the `atom.json` `description` follows, applied to the section's opening line.

Then keep it skimmable. This is a human scanning a catalog, not the agent's prompt. Short bullets over paragraphs, no parenthetical qualifier pile-ups, every line earns its place. If a clause explains a detail the reader doesn't need to decide "is this for me", cut it.

Before (mechanism-led, one dense line):

> Pulls current positions for your tracked keywords from DataForSEO (and your Google Search Console clicks and impressions, if you feed them in), then diffs against last week to show exactly what moved.

After (value-led, skimmable):

> Improves your search rankings, week over week. Each week it:
> - reads where you rank
> - ships one high-leverage fix per opportunity
> - checks whether last week's changes worked and keeps what wins

## Writing "Setup"

A short ordered (or bulleted) list, **one line per required credential or connection**, stating only its *scope* (a read-only key, write access to that repo, SERP + Labs access) and which file to configure. The Required Env sidebar already lists the var names, so never restate them here. End with the one config the agent can't run without (the domain, the site, the repo) and the file to set it in.

Match the hedging to how the agent is actually wired, which AGENTS.md ("Giving an agent capability") defines. The consequence for Setup: the core data sources are all required, so never soften them with "optional", "if you want", or "runs on X alone"; name the primary source and its role in one line instead. The only step you mark optional is a stack-dependent write destination (a GitHub blog vs a CMS or Sanity).

## Other rules

- **Don't document a capability the agent lacks.** If you can't point to the mechanism in the agent's source, cut the line. (A phantom "supply your own browser session" for an agent whose instructions forbid bypassing auth is pure filler.)
- **A boundary line only for a write-capable agent**, stating the limit it holds (fills forms but never submits payment). Never reassure that a read-only agent is read-only.
- **No em dashes** in prose; use commas, colons, or separate sentences.

## Deslopifying an existing README

1. Delete Install, Supported targets, Connections/auth, Limitations, and any env list or "no keys needed" line.
2. Delete how-to-run / Usage prose: schedule cadence, `eve dev`, Slack mentions.
3. Delete the README lead paragraph. The outcome belongs in `atom.json` `description`; make sure that description is outcome-led, not "A browser-driven agent that...".
4. Rewrite the "What it does" opening line to lead with the outcome, and break any dense paragraph into short bullets.
5. Delete "optional", "if you want", and "runs on X alone" hedging; state every wired data source as required.
6. Collapse what remains into What it does and Setup.
7. Cut any line describing a capability you cannot find in the source.
8. Strip em dashes.

## Example

A scheduled, read-only agent with no channel, the common shape. The outcome sentence is the `atom.json` `description`:

```jsonc
// atom.json
"description": "Get a prioritized, fix-it-today report of the SEO and content problems on your site.",
```

```md
# SEO Audit

## What it does

Finds the SEO and content problems on your site and hands you a fix-it-today list.

Opens your site or a sitemap sample in a real browser and checks:
- titles, meta descriptions, and headings
- canonical and robots signals
- broken content and weak CTAs
- content gaps and internal-link opportunities

You get a Markdown report with the findings ordered by severity, each with a concrete fix.

## Setup

Set your site and product context in `agent/instructions.md`.
```
