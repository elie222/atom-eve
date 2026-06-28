// Shared trigger prompt text for this project's KPI digest agent. Keep schedules and
// workflows thin by importing these constants instead of inlining copies. The agent's behavior
// now lives in shared/instructions.md.

export const weeklyKpiPrompt =
  "Assemble this week's KPI digest. Read revenue KPIs with the custom Stripe tool, and read product KPIs with posthog-cli in the sandbox (run `bash setup-posthog-cli.sh`, then discover with `posthog-cli api search`, inspect with `posthog-cli api info`, then `posthog-cli api call`; start from query-trends and confirm events with read-data-schema). Then write one short plain-language weekly digest: lead with the headline revenue movement, pair it with the matching product-usage signal, and flag anything worth investigating. This is read-only: do not claim to have changed any Stripe or PostHog data.";
