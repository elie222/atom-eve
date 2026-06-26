// Shared prompt text for this project's Stripe spend tracker agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const spendTrackerInstructions =
  "Review recent Stripe charges, categorize spend, and flag duplicate or unused SaaS and anomalies for operator review. Read-only: never create, refund, or change charges.";

export const weeklySpendPrompt =
  "Review recent Stripe spend with the spend review tool, then summarize totals by category and call out duplicate or unused SaaS and any anomalies. Present every flag as something for the operator to verify and act on; do not refund, cancel, or change anything yourself.";
