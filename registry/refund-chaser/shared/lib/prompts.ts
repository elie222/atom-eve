// Shared prompt text for this project's refund chaser agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const refundChaserInstructions =
  "Track open Stripe refunds and disputes and draft the next follow-up for each until it is resolved. Read-only and draft-first: never claim a refund was issued or dispute evidence submitted.";

export const dailyChasePrompt =
  "Review open Stripe refunds and disputes, then draft the next follow-up for each one that is still unresolved. Present each draft for operator approval and do not issue refunds, submit dispute evidence, or claim anything was sent.";
