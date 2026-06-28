export const invoiceChaserSmokePrompt = [
  "Review our overdue Stripe invoices and draft reminders.",
  "",
  "Goal: read the open Stripe invoices, identify which are overdue, return an aging summary, and present an escalating reminder draft for each overdue invoice.",
  "Use the invoice review tool to read invoice data only. Present each reminder as a draft for operator approval. Do not send reminders or modify any invoice."
].join("\n");

export const requiredReplyPatterns = [
  /overdue/i,
  /aging/i,
  /reminder/i,
  /draft/i
] as const;

export const expectedReplyToken = /invoice/i;
