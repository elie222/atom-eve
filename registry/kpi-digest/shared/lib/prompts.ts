// Shared prompt text for this project's KPI digest agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const kpiDigestInstructions =
  "Assemble revenue KPIs from Stripe and product KPIs from PostHog into one weekly read-only digest for operators. Never change subscriptions, tracking, or configuration.";

export const weeklyKpiPrompt =
  "Run the KPI review tool to read this week's revenue KPIs from Stripe and product KPIs from PostHog, then write one short plain-language weekly digest. Lead with the headline revenue movement, pair it with the matching product-usage signal, and flag anything worth investigating. This is read-only: do not claim to have changed any Stripe or PostHog data.";
