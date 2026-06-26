import { defineAgent } from "@flue/runtime";
import { reviewTickets } from "../tools/kb-writer/intercom.js";
import { kbWriterInstructions } from "../lib/agents/kb-writer/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: kbWriterInstructions,
  tools: [reviewTickets]
}));
