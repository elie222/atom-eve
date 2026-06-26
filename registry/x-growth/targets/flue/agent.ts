import { defineAgent } from "@flue/runtime";
import { searchMentions } from "../tools/x-growth/x.js";
import { xGrowthInstructions } from "../lib/agents/x-growth/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: xGrowthInstructions,
  tools: [searchMentions]
}));
