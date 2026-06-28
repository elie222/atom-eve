// Shared prompt text for this project's Stripe spend tracker agent. Keep schedules and workflows thin
// by importing these trigger constants instead of inlining copies. Agent behavior lives in
// shared/instructions.md.

export const weeklySpendPrompt =
  "Review recent Stripe spend with the spend review tool, then summarize totals by category and call out duplicate or unused SaaS and any anomalies. Present every flag as something for the operator to verify and act on; do not refund, cancel, or change anything yourself.";
