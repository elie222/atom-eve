# Atom Eve — Agent Roadmap

Think of the registry as **a company staffed entirely by agents**. Each `family` is a
department, each agent is an employee with one job, an API/MCP/CLI to do it through, and a
trigger (scheduled cron or on-demand). The bar for an agent is low on purpose: do one role
well, connect to one or two services, run on a loop or on request.

Anything with an API, MCP server, or CLI is fair game — that is effectively every SaaS
product. Idea sources mined for this list: `skills.sh` (`npx skills find <query>`) and the
[Forward Future Loop Library](https://signals.forwardfuture.com/loop-library/).

**Everything below is phase 1.** No bench, no "next wave" — the goal is a 60+ agent launch
catalog. Merge candidates are noted inline, but default to shipping them as distinct agents.

## Already shipped (6)

| Agent | Category · Family | Integration |
|---|---|---|
| `website-qa` | qa · engineering | agent-browser |
| `facebook-ads` | ads · growth | facebook-ads |
| `error-triage` | observability · engineering | sentry |
| `competitor-analysis` | analytics · data | browser, fetch |
| `seo-audit` | seo · growth | — |
| `content-ideation` | content · growth | — |

## Proposed taxonomy additions

Families stay the same (6 departments). New `categories` to add to `taxonomy.json`:

`email`, `creative`, `video`, `sales`, `crm`, `revops`, `finance`, `docs`, `community`,
`onboarding`, `monitoring`, `code`, `design`, `ux`, `a11y`, `productivity`, `hr`, `pr`,
`research`, `compliance`.

---

# The catalog (phase 1)

Each entry: **name** — what it does. `category · family`. **Integration.** **Trigger.** _Loop._

## 🌱 Growth / Marketing

1. **google-ads** — Reviews Google Ads campaigns, proposes bid/budget/keyword/negative-keyword
   actions. `ads · growth`. **Google Ads API.** Daily cron.
   _Pull yesterday's spend/conv → flag waste & winners → propose changes for approval._

2. **email-loops / email-resend / email-userlist** — Three platform-specific agents that set up
   and run lifecycle/broadcast email (onboarding, winback, newsletters). `email · growth`.
   **Loops / Resend Automations / Userlist APIs** (one each). Weekly cron + on-demand.
   _Gather updates → draft per the shared marketing strategy → build automation/broadcast via the
   platform API → draft-for-approval → report opens & clicks._
   **All three share one remote marketing-strategy skill** (see Skills Architecture) — strategy is
   identical, only the API client in `shared/lib/<platform>.ts` differs. Proof case for remote skills.

3. **social-scheduler** — Turns content briefs into scheduled posts across X + LinkedIn.
   `social · growth`. **Ayrshare / Typefully API.** Daily cron.
   _Take approved ideas → format per platform → queue at optimal times → log performance._

4. **x-growth** — Writes threads, monitors mentions/keywords, drafts replies for approval.
   `social · growth`. **X API.** Cron + on-demand.
   _Listen for brand/keyword mentions → draft engagement → propose original posts from wins._

5. **creative-studio** — Generates ad creatives and social images from briefs.
   `creative · growth`. **fal / Replicate (image models).** On-demand.
   _Brief + brand kit → generate variants → score for the platform → hand off best to ads agents._

6. **short-video** — Cuts short-form clips/captioned videos from long content.
   `video · growth`. **fal / Replicate / ffmpeg in sandbox.** On-demand.
   _Source video/transcript → find hooks → cut + caption → export vertical clips._

7. **thumbnail-studio** — Iterates YouTube/social thumbnail concepts until one clears a quality
   bar (no clickbait). `creative · growth`. **fal / Replicate.** On-demand. *(Loop Library)*
   _Generate concepts → score against brand + clarity bar → refine the weakest → ship the winner._

8. **product-podcast** — Turns meaningful product updates into a short, source-grounded podcast
   episode. `video · growth`. **TTS (ElevenLabs) + changelog/GitHub.** Weekly cron. *(Loop Library)*
   _Collect real updates → script grounded in sources → generate audio → publish + show notes._

9. **reddit-radar** — Finds relevant subreddit threads, drafts non-spammy replies.
   `social · growth`. **Reddit API.** Daily cron.
   _Monitor target subs/keywords → rank by fit & reach → draft helpful replies for approval._

10. **launch-captain** — Plans and runs a Product Hunt / Hacker News / launch-day playbook.
    `content · growth`. **fetch / browser.** On-demand.
    _Build asset checklist → draft copy & comments → schedule → track ranking on the day._

11. **reviews-harvester** — Requests, monitors, and responds to reviews.
    `support · growth`. **G2 / Trustpilot / Capterra / fetch.** Weekly cron.
    _Watch new reviews → draft responses → request reviews from happy users → flag detractors._

12. **cro-optimizer** — Audits landing pages and proposes conversion experiments.
    `seo · growth`. **browser + PostHog.** Weekly cron.
    _Crawl key pages → heuristic + data review → rank A/B test ideas with hypotheses._

13. **buyer-voice** — Mines repeated buyer objections to rewrite landing-page copy in customers'
    own words. `content · growth`. **Helpdesk/CRM + call transcripts.** On-demand. *(Loop Library)*
    _Collect objections from calls/tickets → cluster → draft copy in their language → test._

14. **claim-checker** — Verifies every customer-facing claim is true, fixes the riskiest mismatch
    first. `compliance · growth`. **browser + product/docs.** Weekly cron. *(Loop Library)*
    _Crawl site/marketing → check each claim vs product reality → flag/repair overstatements._

15. **pr-pitcher** — Answers journalist source requests and drafts pitches.
    `pr · growth`. **Connectively (HARO) / Featured / email.** Daily cron.
    _Pull relevant queries → match to expertise → draft quotable responses for approval._

16. **link-builder** — Finds backlink opportunities and drafts outreach.
    `seo · growth`. **fetch + email/Instantly.** Weekly cron.
    _Find guest-post / link prospects → qualify → draft personalized outreach._

17. **blog-writer** — Drafts long-form SEO articles from keyword briefs.
    `content · growth`. **fetch + CMS API.** On-demand.
    _Take brief → outline → draft with internal links → SEO checks → draft-for-approval._

18. **keyword-researcher** — Keyword/topic research with volume & difficulty.
    `seo · growth`. **DataForSEO / Ahrefs API.** Weekly cron.
    _Seed topics → pull volume/difficulty/SERP → cluster into a prioritized content map._

## 💰 Revenue / Sales

19. **instantly-outreach** ⭐ *(flagship)* — Runs the full cold-email engine.
    `outreach · revenue`. **Apollo API + Instantly API.** Cron (every 3 days) + weekly review.
    _Every 3 days: pull fresh leads from Apollo by ICP → dedupe vs DB → build Instantly campaign
    with a 3–4 step follow-up sequence → launch. Weekly: pull reply/open/positive data → archive
    spent campaigns → store results in DB → spin up a fresh campaign with the best-performing copy._

20. **crm-hygiene** — Keeps the CRM clean and enriched.
    `crm · revenue`. **HubSpot / Salesforce + Apollo/Clearbit.** Daily cron.
    _Dedupe contacts → enrich missing fields → fix stages → flag stale deals._

21. **lead-router** — Scores inbound leads and routes/notifies.
    `crm · revenue`. **CRM + Slack.** On webhook / hourly.
    _Score by ICP fit & intent → assign owner → post to Slack → draft first-touch._

22. **deal-followup** — Turns sales-call transcripts into follow-ups and CRM updates.
    `sales · revenue`. **Fireflies / Fathom + CRM + email.** On-demand / after call.
    _Ingest transcript → extract next steps → draft recap email → update deal fields._

23. **winback** — Detects churn risk and runs win-back outreach.
    `revops · revenue`. **Stripe + email.** Weekly cron.
    _Find cancellations & at-risk accounts → segment reasons → draft win-back offers._

24. **revenue-digest** — Weekly MRR / churn / growth report.
    `revops · revenue`. **Stripe API.** Weekly cron.
    _Pull MRR, new/expansion/churn, top accounts → write digest → post to Slack._

25. **dunning** — Recovers failed payments.
    `finance · revenue`. **Stripe API.** Daily cron.
    _Find failed charges/expiring cards → draft staged recovery emails → track recovery rate._

26. **invoice-chaser** — Chases overdue invoices (AR).
    `finance · revenue`. **Stripe Invoicing / QuickBooks.** Daily cron.
    _Find overdue invoices → send escalating reminders → report aging summary._

27. **refund-chaser** — Pursues a refund/chargeback resolution until the money arrives or it
    genuinely needs the user. `finance · revenue`. **Stripe / email / browser.** On-demand. *(Loop Library)*
    _Open case → follow up on a cadence → escalate → stop only on resolution or a real blocker._

## 🎧 Support

28. **support-replies** — Drafts/sends answers to inbound tickets from the knowledge base.
    `support · support`. **Intercom / Crisp / Zendesk / Help Scout.** On webhook.
    _Read ticket → search docs → draft grounded reply → auto-send simple ones, escalate the rest._

29. **kb-writer** — Turns resolved tickets into knowledge-base articles.
    `docs · support`. **Helpdesk API + docs/CMS.** Weekly cron.
    _Cluster recurring questions → draft/update articles → flag doc gaps to product._

30. **feedback-aggregator** — Collects, dedupes, and tallies feature requests.
    `support · support`. **Helpdesk + Linear/GitHub + Slack.** Weekly cron.
    _Mine tickets/reviews/community → dedupe into themes → rank by frequency × value._

31. **onboarding-coach** — Drives new-user activation via in-app + email nudges.
    `onboarding · support`. **PostHog + email.** Daily cron.
    _Find users stuck before activation → send the right nudge → measure step completion._

32. **community-support** — Answers questions in Discord/Slack community.
    `community · support`. **Discord / Slack API + docs.** On message.
    _Watch channels → answer from docs → escalate hard ones → summarize trends weekly._

33. **feedback-sweep** — Turns recent user corrections/complaints into a project-wide audit and
    verified fixes. `support · support`. **Helpdesk + GitHub.** Weekly cron. *(Loop Library)*
    _Collect recent feedback → find every related instance in product/docs → fix + verify._

34. **error-copy** — Finds every user-facing error message, rewrites weak copy, verifies reachable
    states. `ux · support`. **browser + repo.** On-demand. *(Loop Library)*
    _Enumerate error strings → rewrite for clarity/empathy → confirm states are reachable._

## 🛠 Engineering / Product

35. **code-reviewer** — Reviews open PRs for bugs and cleanups.
    `code · engineering`. **GitHub API.** On PR / cron.
    _Diff review → flag correctness + simplification issues → post inline comments._

36. **adversarial-reviewer** — Independent second-opinion review (multi-LLM / devil's advocate)
    until blocking findings resolve. `code · engineering`. **GitHub + 2nd model.** On PR. *(Loop Library)*
    _Re-review a PR adversarially → surface high-impact objections → loop until resolved or accepted._

37. **dep-guardian** — Burns down dependency CVEs in risk order; triages Dependabot PRs.
    `code · engineering`. **GitHub + npm/osv.** Daily cron. *(Loop Library: CVE burndown + triage)*
    _Scan manifests → rank reachable vulns by risk → open grouped update PRs → rescan after each._

37. **uptime-monitor** — Pings endpoints/flows and alerts on regressions.
    `monitoring · engineering`. **fetch + Slack/PagerDuty.** Cron (frequent).
    _Hit health endpoints & key pages → check status/latency/content → alert + log incidents._

38. **a11y-auditor** — Finds and repairs accessibility barriers (keyboard, screen-reader, low-vision)
    worst-first. `a11y · engineering`. **browser + axe-core.** Weekly cron. *(Loop Library)*
    _Crawl key pages → run axe → group WCAG violations by harm → propose fixes._

39. **release-notes** — Generates changelogs/release notes from merged PRs (nightly + on release).
    `docs · engineering`. **GitHub API.** Cron / on release. *(Loop Library: nightly changelog)*
    _Collect merged PRs since last tag → group by type → write user-facing notes → draft post._

40. **docs-sync** — Keeps docs aligned with the current codebase and opens a reviewable PR.
    `docs · engineering`. **GitHub API.** Daily cron. *(Loop Library)*
    _Diff code vs docs → find drift → update docs → open PR with rationale._

41. **perf-auditor** — Optimizes one measured bottleneck at a time (page-load, cold-load bundle,
    CSS weight, frame-rate). `monitoring · engineering`. **browser + Lighthouse.** Weekly cron. *(Loop Library ×4)*
    _Measure → find the worst bottleneck → propose/apply a behavior-preserving fix → re-measure._

42. **test-writer** — Adds meaningful tests until coverage targets are met; keeps the suite fast.
    `code · engineering`. **GitHub + test runner.** On-demand. *(Loop Library: coverage + speed)*
    _Find untested paths → write real assertions → verify → guard suite runtime._

43. **flaky-test-fixer** — Finds flaky tests, fixes root causes, proves stability with repeated runs.
    `code · engineering`. **CI logs + GitHub.** Weekly cron. *(Loop Library)*
    _Detect flakes from CI history → diagnose root cause → fix → prove with repeated full runs._

44. **logging-coverage** — Adds useful, tested logs to important system paths.
    `monitoring · engineering`. **GitHub + repo.** On-demand. *(Loop Library)*
    _Map critical paths → find logging gaps → add structured logs → verify they fire._

45. **ticket-to-pr** — Turns a ticket or complaint into a verified, reviewer-ready PR.
    `code · engineering`. **Linear/GitHub Issues + GitHub.** On ticket. *(Loop Library)*
    _Read ticket → reproduce → implement slice → add tests → open PR with evidence._

46. **repo-janitor** — Cleans the project one proven, low-risk change at a time.
    `code · engineering`. **GitHub.** Weekly cron. *(Loop Library: housekeeper + cleanup)*
    _Find dead code / stale files / lint debt → make safe isolated fixes → leave uncertain work._

47. **onboarding-tester** — Acts like a first-time dev: clean clone from the README until no hidden
    setup assumptions remain. `qa · engineering`. **sandbox + browser.** Weekly cron. *(Loop Library)*
    _Fresh clone → follow README → hit a blocker → fix the doc/script → retry from clean._

48. **backup-verifier** — Proves real backups can restore required scenarios in a disposable
    clean-room. `monitoring · engineering`. **sandbox + cloud/db APIs.** Weekly cron. *(Loop Library)*
    _Spin clean env → restore from backup → verify required scenarios → report gaps._

49. **value-propagation** — After one value changes, finds every other place still showing the old
    value. `code · engineering`. **repo + GitHub.** On-demand. *(Loop Library)*
    _Given a changed value → search code/docs/config for stale copies → fix all → verify._

50. **data-compliance** — Removes disallowed production data and prevents reclassification errors
    from returning. `compliance · engineering`. **db/warehouse APIs.** Daily cron. *(Loop Library)*
    _Scan for disallowed/PII data → remove per policy → add guards → re-audit._

51. **status-comms** — Drafts incident/status-page updates during outages.
    `monitoring · engineering`. **Statuspage + Slack.** On incident.
    _Detect incident → draft customer-facing update → post → draft post-mortem._

## 🎨 Design / UX

52. **ux-reviewer** — Walks a real user task, scores each screen, improves weak spots, retests.
    `ux · engineering`. **browser + screenshots.** Weekly cron. *(Loop Library: UI/UX score)*
    _Run the task → score each screen → fix the weakest → retest until the bar is cleared._

53. **visual-regression** — Catches unintended UI diffs across releases.
    `design · engineering`. **browser + screenshot diff.** On PR / cron.
    _Snapshot key screens → diff vs baseline → flag unintended changes._

54. **microcopy** — Improves in-product copy, empty states, and microcopy.
    `ux · engineering`. **repo + browser.** On-demand.
    _Audit strings → rewrite for clarity/voice → draft-for-approval._

## 📊 Data / Analytics

55. **analytics-digest** — Weekly PostHog product digest.
    `analytics · data`. **PostHog API.** Weekly cron.
    _Pull key events/trends → write a plain-language digest → post to Slack._

56. **funnel-analyst** — Funnel / retention / cohort analysis.
    `analytics · data`. **PostHog API.** Weekly cron.
    _Build funnels → find biggest drop-offs → cohort/retention deltas → recommend._

57. **experiment-analyst** — Reads A/B test results and calls winners.
    `analytics · data`. **PostHog experiments.** On test end.
    _Pull experiment data → check significance → call winner → summarize learnings._

58. **kpi-digest** — Cross-source KPI Slack digest.
    `analytics · data`. **Stripe + PostHog + Slack.** Weekly cron.
    _Pull revenue + product + growth KPIs → assemble one digest → post._

59. **research-assistant** — Turns a focused question into a sourced artifact for a real decision.
    `research · data`. **web search + fetch.** On-demand. *(Loop Library: research-to-artifact)*
    _Scope question → gather + verify sources → synthesize a cited brief for the decision._

## ⚙️ Ops / Internal

60. **inbox-triage** — Triages and drafts replies to email (Inbox Zero–style).
    `productivity · ops`. **Gmail API.** Cron / on new mail.
    _Classify inbox → archive/label noise → draft replies for the rest → surface what needs you._

61. **meeting-notes** — Summarizes meetings into notes + action items, routes follow-ups.
    `productivity · ops`. **Fireflies / Fathom + Slack/Linear.** After meeting.
    _Ingest transcript → summary + decisions + actions → assign/route follow-ups._

62. **standup-bot** — Collects async standups and maintains a daily project narrative.
    `productivity · ops`. **Slack + GitHub/Linear.** Daily cron. *(Loop Library: living story)*
    _Gather updates + activity → write a digest/narrative of priorities, threads, wins → post._

63. **recruiter** — Screens applicants, sources candidates, drafts outreach.
    `hr · ops`. **Ashby / Greenhouse + LinkedIn.** Daily cron.
    _Score applicants vs role → shortlist → draft outreach → schedule screens._

64. **spend-tracker** — Tracks SaaS subscriptions & spend, flags waste.
    `finance · ops`. **Stripe / Ramp / bank API.** Weekly cron.
    _Categorize spend → flag duplicate/unused SaaS → surface anomalies → report._

---

# Skills architecture (decided)

Agents reference two kinds of skills. Support both.

1. **Owned local skills** — live in `registry/<agent>/shared/skills/` and are copied on install
   (today's model, e.g. `facebook-ads/daily-loop.md`). This *is* the agent's operational loop.
   We may also publish these to skills.sh for marketing reach — vendored **and** listed.
2. **Remote shared skills** — cross-cutting expertise (e.g. Corey Haines marketing playbooks)
   referenced by a skills.sh id, **never copy-pasted into our repo**, pulled at install time.
   Many agents can share one ref (the 3 email agents share one marketing-strategy skill).

**Why remote:** neither Eve nor Flue support runtime-remote skills (both need files locally), but
the *source of truth* can be remote — authored once, version-pinned, updatable, and DRY across
our repo. skills.sh `add` vendors-with-a-lockfile (`.skills.json` tracks source + version).

**Mechanism to build (foundational task, do before the email trio):**
- **Schema** (`packages/schemas`): add `skills: [{ ref, source?, version? }]` to `atomSchema`.
- **CLI** (`packages/cli`): after the file install, resolve each `ref` via the skills.sh API
  (`GET /api/v1/skills/{source}/{slug}` → `files[]` + hash) and write into the framework's skills
  dir (`agent/skills/` for Eve, `src/skills/` for Flue); record refs+hash for `update`.
- **Flue wiring**: Flue requires an explicit `import … with { type: 'skill' }` + inclusion in the
  agent `skills:[]` array, so the Flue `agent.ts` wrapper must import remote skills by a
  deterministic installed path. Eve only needs file presence.
- **README/atom.json**: surface which remote skills get pulled; note version-pin + availability
  trade-off (install depends on the source being reachable).

---

# Build-phase notes

- Every agent follows the existing folder pattern: `atom.json` + `shared/instructions.md` +
  `shared/skills/*.md` + thin `targets/eve` & `targets/flue` wrappers. Shared behavior lives in
  `shared/`, never duplicated across targets.
- Prefer **MCP or CLI** integrations the framework can run directly over custom wrapper tools
  (per `AGENTS.md` browser/sandbox rule).
- Agents that **write to the world** (send emails, post, comment, change budgets) should default
  to **draft-for-approval**, matching how `facebook-ads` proposes actions.
- Agents needing memory across runs (instantly-outreach, competitor-analysis) store history
  locally / in a DB and diff against it, like `seo-audit` and `competitor-analysis` already do.
- `requiredEnv` + `connections` in `atom.json` are the install-time contract — get those right
  per agent so `npx atom-eve add <name>` tells the user exactly what credentials to add.
- Build the **remote-skill mechanism first** (see Skills Architecture), then the email trio proves it.
