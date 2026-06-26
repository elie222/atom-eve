export const kpiDigestSmokePrompt = [
  "Assemble this week's KPI digest.",
  "",
  "Goal: read revenue KPIs from Stripe and product KPIs from PostHog, then write one short weekly digest for operators.",
  "Read revenue with the custom Stripe tool. For product KPIs, first run bash setup-posthog-cli.sh, then use posthog-cli in the sandbox: discover a tool with `posthog-cli api search`, inspect it with `posthog-cli api info`, then `posthog-cli api call`. Lead with the headline revenue movement and pair it with the matching product-usage signal. Do not change any subscriptions, tracking, or configuration. If a source is unavailable, report that blocker clearly instead of inventing numbers."
].join("\n");

export const requiredReplyPatterns = [
  /revenue|mrr/i,
  /product|event/i,
  /digest/i
] as const;

export const expectedReplyToken = /KPI/i;

export const posthogCliCommandPattern = /posthog-cli/;
