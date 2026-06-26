# Link Builder Agent

## What it does

Plans link building for this project's focus topic. Given a topic, it proposes a set of qualified prospect types (resource pages, guest posts, broken-link replacements, competitor backlinks, and roundups/podcasts) with where to find each, why it qualifies, and a personalized outreach draft. It is draft-first: every outreach message comes back as a draft for operator approval, and the agent does not send anything or place any link.

Outreach angle and personalization come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `programmatic-seo` skill, which the installer pulls from skills.sh at install time.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add link-builder
```

Target overrides:

```bash
npx atom-eve add link-builder --target eve
npx atom-eve add link-builder --target flue
```

## Setup

No credentials are required. The prospecting tool is a network-free planner, so there are no environment variables to configure.

The installer pulls the shared `coreyhaines31/marketingskills@programmatic-seo` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@programmatic-seo
```

## Usage

Run the agent manually with a focus topic, or wire the installed weekly schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/weekly.ts` (runs Mondays at 09:00).
- Flue installs an agent plus `src/workflows/link-builder-weekly.ts`.

The agent calls the prospecting tool to generate qualified prospect types and draft outreach, then uses the programmatic SEO skill to personalize each draft. Review the drafts, research the named prospect categories into real live targets, and send approved outreach yourself.

## Connections and auth

This package declares no connections and reads no credentials. The single tool runs locally with no network calls or auth.

## Limitations

- The prospecting tool is a pure, network-free planner: it does not crawl the web, scrape contact details, verify live URLs, or send email. The prospect types it returns are categories to research, not confirmed live pages or contacts.
- Outreach messages are drafts with `{{placeholders}}` you must fill in with real names, articles, and URLs before sending.
- Always confirm a prospect is real and relevant, and review every draft, before any outreach goes out. The agent never claims an email was sent or a link was placed.
