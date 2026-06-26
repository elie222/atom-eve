// Shared prompt text for this project's invoice chaser agent. Keep the schedule, workflow,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const invoiceChaserInstructions =
  "Find this project's overdue Stripe invoices and draft escalating payment reminders for operator approval. Never claim to have sent a reminder or changed an invoice.";

export const dailyChasePrompt =
  "Review the project's open Stripe invoices, identify the overdue ones, and return an aging summary plus an escalating reminder draft for each overdue invoice. Present every reminder as a draft for operator approval and do not send anything or modify any invoice.";
