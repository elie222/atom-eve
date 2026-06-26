// Shared prompt text for this project's revenue digest agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const revenueDigestInstructions =
  "Read Stripe revenue data and summarize MRR, new and churned subscriptions, and top accounts into a weekly digest. Read-only: never create, update, or cancel subscriptions, invoices, or customers.";

export const weeklyDigestPrompt =
  "Run the revenue review tool to read Stripe subscriptions and invoices, then write this week's revenue digest: MRR and its change, new and churned subscriptions, collected revenue, and the top accounts by MRR. Call out the read-only recommendations and note that expansion needs last week's saved snapshot. Do not make any changes in Stripe.";
