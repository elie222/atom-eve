import { defineAgent } from "@flue/runtime";
import { reviewOutreach } from "../tools/instantly-outreach/outreach.js";
import { outreachInstructions } from "../lib/agents/instantly-outreach/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: outreachInstructions,
  tools: [reviewOutreach]
}));
