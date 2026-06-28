// Shared prompt text for this project's revenue digest agent. Keep schedules and workflows thin by
// importing these trigger constants instead of inlining copies. Agent behavior lives in
// shared/instructions.md.

export const weeklyDigestPrompt =
  "Run the revenue review tool to read Stripe subscriptions and invoices, then write this week's revenue digest: MRR and its change, new and churned subscriptions, collected revenue, and the top accounts by MRR. Call out the read-only recommendations and note that expansion needs last week's saved snapshot. Do not make any changes in Stripe.";
