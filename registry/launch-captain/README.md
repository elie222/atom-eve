# Launch Captain Agent

## What it does

Plans and prepares a launch-day playbook for your product on the channel you name: [Product Hunt](https://www.producthunt.com), [Hacker News](https://news.ycombinator.com) (Show HN), or a general multi-channel launch day. For each launch it returns an asset checklist, draft copy and comments, and a proposed posting schedule. It is draft-first: everything comes back as operator-ready drafts for approval, and the agent does not post, submit, schedule, or send anything on its own.

Launch angles and copy quality come from a shared remote skill rather than copy-pasted prompt text. This agent declares the Corey Haines `marketing-ideas` skill, which the installer pulls from skills.sh at install time. The only custom tool is a small, network-free launch planner.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add launch-captain
```

Target overrides:

```bash
npx atom-eve add launch-captain --target eve
npx atom-eve add launch-captain --target flue
```

## Setup

No environment variables are required.

The agent does not call Product Hunt, Hacker News, or any platform API. You run it on demand against a product and channel, and it returns a draft playbook for you to finish and post yourself.

The installer also pulls the shared `coreyhaines31/marketingskills@marketing-ideas` skill from skills.sh into your agent's skills directory. If your environment blocks that fetch, install it manually:

```bash
npx skills add coreyhaines31/marketingskills@marketing-ideas
```

## Usage

This agent is on demand: there is no schedule or workflow. Run it whenever you are preparing a launch, passing the product and the channel you want a playbook for.

The agent uses the `plan_launch` tool to get an asset checklist, copy scaffolds (tagline, description, first comment, email, social posts), and a proposed posting schedule, then uses the marketing-ideas skill to turn the scaffolds into finished, on-brand copy. Review the approved drafts and post them yourself, or add your own write tool.

## Connections and auth

This package uses no external connections or credentials. The `plan_launch` tool is a pure, network-free planner: it takes a `product` and a `channel` and returns a checklist, draft copy, and a schedule. It does not call any platform or post anything.

## Limitations

- The `plan_launch` tool is a pure, network-free planner. It does not call Product Hunt, Hacker News, or any platform API, so it cannot read live launch data, rankings, or comments.
- The asset checklists, schedules, and copy are draft scaffolds and best-practice starting points, not a substitute for operator judgement or current platform rules.
- Publishing a listing, submitting a Show HN, scheduling posts, sending email, and tracking results are intentionally left to the operator or a write tool you add yourself.
- Always review the drafted copy and confirm platform guidelines before launching for real.
