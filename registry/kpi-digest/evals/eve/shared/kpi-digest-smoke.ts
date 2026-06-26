export const kpiDigestSmokePrompt = [
  "Assemble this week's KPI digest.",
  "",
  "Goal: read revenue KPIs from Stripe and product KPIs from PostHog, then write one short weekly digest for operators.",
  "Use the KPI review tool to read data only. Lead with the headline revenue movement and pair it with the matching product-usage signal. Do not change any subscriptions, tracking, or configuration."
].join("\n");

export const requiredReplyPatterns = [
  /revenue|mrr/i,
  /product|event/i,
  /digest/i
] as const;

export const expectedReplyToken = /KPI/i;
