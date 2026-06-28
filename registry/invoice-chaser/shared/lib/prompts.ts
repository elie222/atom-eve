// Shared trigger prompt text for this project's invoice chaser agent. Keep the schedule and
// workflow thin by importing these constants instead of inlining copies. The agent's behavior
// now lives in shared/instructions.md.

export const dailyChasePrompt =
  "Review the project's open Stripe invoices, identify the overdue ones, and return an aging summary plus an escalating reminder draft for each overdue invoice. Present every reminder as a draft for operator approval and do not send anything or modify any invoice.";
