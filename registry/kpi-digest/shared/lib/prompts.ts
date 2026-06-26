// Shared prompt text for this project's KPI digest agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const kpiDigestInstructions = [
  "Assemble revenue KPIs from Stripe and product KPIs from PostHog into one weekly read-only digest for operators.",
  "Read revenue KPIs with the custom Stripe tool (it reads MRR, active/new/churned subscriptions, collected revenue, and top accounts).",
  "Read product KPIs with the official posthog-cli in the sandbox/command capability: run `bash setup-posthog-cli.sh` first, then discover a tool with `posthog-cli api search`, inspect it with `posthog-cli api info <tool>` (required), confirm events with read-data-schema, then `posthog-cli api call <tool> '<json>'`. Never guess tool names or schemas.",
  "Read-only and draft-first: never mutate Stripe or PostHog, never pass --confirm, and never claim to have changed subscriptions, tracking, dashboards, or any configuration."
].join(" ");

export const weeklyKpiPrompt =
  "Assemble this week's KPI digest. Read revenue KPIs with the custom Stripe tool, and read product KPIs with posthog-cli in the sandbox (run `bash setup-posthog-cli.sh`, then discover with `posthog-cli api search`, inspect with `posthog-cli api info`, then `posthog-cli api call`; start from query-trends and confirm events with read-data-schema). Then write one short plain-language weekly digest: lead with the headline revenue movement, pair it with the matching product-usage signal, and flag anything worth investigating. This is read-only: do not claim to have changed any Stripe or PostHog data.";
