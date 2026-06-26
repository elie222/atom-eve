import { defineAgent } from "@flue/runtime";
import { reviewAudience } from "../tools/email-loops/loops.js";
import { emailLoopsInstructions } from "../lib/agents/email-loops/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: emailLoopsInstructions,
  tools: [reviewAudience]
}));
