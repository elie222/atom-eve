# Future Agent Backlog

This is a candidate list, not an approval queue. The registry should stay small enough that every
installable agent is useful, reviewable, and likely to work for a real user.

Before promoting a candidate into `registry/<agent>/`:

- Confirm it needs an agent loop, model judgment, or recurring review. If it is just a deterministic
  helper, make it code or a tool instead.
- Prefer a real integration path: MCP server, official API, CLI, browser automation, or a clearly
  configured local data source.
- Author only the Eve source in `registry/<agent>/agent/**`; Flue is generated from Eve.
- Include a short README, clear setup requirements, required env vars, and a smoke eval.
- Run `pnpm check`.

## Strong Candidates

These have an obvious external system or recurring operational loop.

| Candidate | One-liner |
|---|---|
| `facebook-ads` | Review Meta Ads performance and draft daily optimization actions for approval. |
| `google-ads` | Review Google Ads spend, conversion, and keyword data; propose budget and search-term actions. |
| `error-triage` | Pull recent Sentry issues, group likely causes, and draft a triage report. |
| `crm-hygiene` | Inspect CRM contacts and deals for duplicates, stale stages, and missing required fields. |
| `lead-router` | Score inbound leads and route them to the right owner with a drafted first touch. |
| `dunning` | Review failed Stripe payments and draft staged recovery actions. |
| `invoice-chaser` | Find overdue invoices and draft escalating collection reminders. |
| `refund-chaser` | Track refunds or chargebacks until resolved or genuinely blocked. |
| `revenue-digest` | Produce a weekly Stripe revenue, churn, and expansion summary. |
| `winback` | Detect churn-risk or canceled accounts and draft win-back outreach. |
| `spend-tracker` | Review subscription and spend data for waste, duplicates, and anomalies. |
| `code-reviewer` | Review open GitHub PRs for correctness risks and simplification opportunities. |
| `dep-guardian` | Triage dependency updates and reachable security issues from GitHub and package metadata. |
| `docs-sync` | Detect code/docs drift and draft a documentation update PR. |
| `flaky-test-fixer` | Mine CI history for flaky tests, propose root-cause fixes, and verify stability. |
| `recruiter` | Review applicants in an ATS and draft shortlist notes or outreach. |
| `kb-writer` | Turn repeated support tickets into draft knowledge-base articles. |
| `feedback-sweep` | Convert recent support issues into a scoped product/docs audit. |
| `inbox-triage` | Classify email, draft replies, and surface only mail that needs human action. |
| `instantly-outreach` | Pull ICP leads, draft outbound sequences, and review campaign performance. |
| `keyword-researcher` | Pull SEO keyword volume and difficulty, then cluster topics into a content map. |
| `creative-studio` | Generate ad or social creative variants from a brief and return reviewable drafts. |
| `thumbnail-studio` | Generate and score thumbnail concepts against brand and clarity constraints. |
| `short-video` | Turn long-form video or transcripts into proposed short-form clip plans. |
| `social-scheduler` | Turn approved content ideas into scheduled platform-specific social posts. |
| `product-podcast` | Produce a short product-update podcast script and audio draft from source material. |
| `uptime-monitor` | Check configured endpoints or flows and report regressions. |
| `kpi-digest` | Combine Stripe and product analytics into a weekly KPI summary. |

## Needs More Product Definition

These may be useful, but should not ship until the exact input, integration, and output workflow are
clear enough to avoid generic promptware.

| Candidate | One-liner |
|---|---|
| `blog-writer` | Draft long-form SEO articles from a keyword brief and source material. |
| `buyer-voice` | Mine customer language from calls or tickets and draft landing-page copy. |
| `email-loops` | Review Loops audiences and draft lifecycle email improvements. |
| `email-resend` | Review Resend audiences and draft broadcast or automation changes. |
| `email-userlist` | Review Userlist segments and draft lifecycle campaign changes. |
| `link-builder` | Find backlink prospects and draft personalized outreach. |
| `pr-pitcher` | Match journalist requests to company expertise and draft responses. |
| `reviews-harvester` | Monitor review sites and draft responses or review-request campaigns. |
| `launch-captain` | Build a launch checklist and draft launch copy for Product Hunt, HN, or a launch day. |
| `feedback-aggregator` | Cluster feedback from multiple channels into ranked themes. |
| `data-compliance` | Plan scans for disallowed data and report cleanup actions. |
| `backup-verifier` | Plan and report restore verification for configured backup scenarios. |
| `repo-janitor` | Find low-risk repo cleanup work and propose isolated changes. |
| `logging-coverage` | Identify missing structured logs in important code paths. |
| `test-writer` | Draft focused test cases for untested paths. |
| `value-propagation` | Find stale copies of a changed value across code, docs, and config. |
| `microcopy` | Review product strings and draft clearer UI copy. |
| `status-comms` | Draft incident/status-page updates from operational context. |
| `deal-followup` | Convert sales-call notes into follow-up emails and CRM update drafts. |

## Legacy Candidates

These were intentionally not promoted from `_legacy/`. Revisit only after there is a clear,
working integration story.

| Candidate | One-liner |
|---|---|
| `community-support` | Answer Discord or Slack community questions from project docs. |
| `meeting-notes` | Convert meeting transcripts into decisions and follow-up actions. |
| `reddit-radar` | Find relevant Reddit discussions and draft non-spammy replies. |
| `standup-bot` | Collect async standups and publish a daily project narrative. |
| `support-replies` | Draft grounded helpdesk replies from docs and ticket context. |
| `ticket-to-pr` | Turn a ticket into a scoped, verified GitHub PR. |
| `x-growth` | Monitor X mentions and draft useful replies or posts. |
