import { defineAgent } from "@flue/runtime";
import { draftResponses } from "../tools/reviews-harvester/reviews.js";

export default defineAgent(() => ({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [draftResponses]
}));
