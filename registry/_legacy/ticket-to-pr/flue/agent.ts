import { defineAgent } from "@flue/runtime";
import { reviewTicket } from "../tools/ticket-to-pr/linear.js";

export default defineAgent(() => ({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewTicket]
}));
