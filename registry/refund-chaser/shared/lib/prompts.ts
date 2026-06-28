// Shared trigger prompt text for this project's refund chaser agent. Keep schedules and workflows
// thin by importing these constants instead of inlining copies. The agent's behavior summary lives
// in shared/instructions.md.

export const dailyChasePrompt =
  "Review open Stripe refunds and disputes, then draft the next follow-up for each one that is still unresolved. Present each draft for operator approval and do not issue refunds, submit dispute evidence, or claim anything was sent.";
