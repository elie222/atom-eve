import { defineAgent } from "@flue/runtime";
import { reviewInvoices } from "../tools/invoice-chaser/stripe.js";
import { invoiceChaserInstructions } from "../lib/agents/invoice-chaser/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: invoiceChaserInstructions,
  tools: [reviewInvoices]
}));
