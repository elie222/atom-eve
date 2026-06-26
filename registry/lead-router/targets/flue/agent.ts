import { defineAgent } from "@flue/runtime";
import { reviewLeads } from "../tools/lead-router/hubspot.js";
import { leadRouterInstructions } from "../lib/agents/lead-router/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: leadRouterInstructions,
  tools: [reviewLeads]
}));
