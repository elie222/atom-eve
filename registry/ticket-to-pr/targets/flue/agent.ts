import { defineAgent } from "@flue/runtime";
import { reviewTicket } from "../tools/ticket-to-pr/linear.js";
import { ticketToPrInstructions } from "../lib/agents/ticket-to-pr/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: ticketToPrInstructions,
  tools: [reviewTicket]
}));
