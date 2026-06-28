# Blog Writer Agent

## What it does

Drafts long-form, SEO-oriented articles from a keyword brief. It is draft-first and works in three steps: build an outline, expand it into a draft scaffold with internal-link suggestions, then run a set of on-page SEO checks. Every article comes back as an operator-ready draft. The agent does not publish anything.

The article structure and SEO checklist come from a small, network-free planner tool. Voice, hooks, and persuasion come from a shared remote skill rather than copy-pasted prompt text: this agent declares the Corey Haines `copywriting` skill, which the installer pulls from skills.sh at install time.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add blog-writer
```

Target overrides:

```bash
npx atom-eve add blog-writer --target eve
npx atom-eve add blog-writer --target flue
```

## Setup

No environment variables are required. The planner tool is pure and runs offline.

The installer also pulls the shared `coreyhaines31/marketingskills@copywriting` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@copywriting
```

## Usage

This agent is on-demand: there is no schedule or workflow. Run it whenever you have a keyword brief.

Give it a primary keyword (plus optional audience, target word count, secondary keywords, and a list of existing pages to link to). The `draft_article` tool returns an outline, a draft scaffold with internal-link placement notes, and an on-page SEO checklist. The agent then uses the copywriting skill to expand the scaffold into a full draft. Review and publish the approved draft yourself.

- Eve installs as the root agent under `agent/`, with `agent/tools/draft_article.ts`.
- Flue installs an agent plus `src/tools/blog-writer/article.ts`.

## Connections and auth

None. The agent ships only a pure planner tool that needs no API keys or network access. The `fetch` integration is declared so you can add your own research/reading tools later without changing the manifest shape.

## Limitations

- The planner is pure and network-free: it scaffolds structure and SEO checks but does not fetch live SERP data, keyword volume, or competitor pages.
- It does not verify that suggested internal links exist or are relevant; you must supply the candidate pages and confirm placements.
- It does not publish, schedule, or push to a CMS. Always review the drafted copy and SEO checklist before publishing.
