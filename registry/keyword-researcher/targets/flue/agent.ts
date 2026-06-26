import { defineAgent } from "@flue/runtime";
import { researchKeywordsTool } from "../tools/keyword-researcher/dataforseo.js";
import { keywordResearcherInstructions } from "../lib/agents/keyword-researcher/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: keywordResearcherInstructions,
  tools: [researchKeywordsTool]
}));
