import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Finds overdue Stripe invoices and drafts escalating payment reminders for operator approval."
});
