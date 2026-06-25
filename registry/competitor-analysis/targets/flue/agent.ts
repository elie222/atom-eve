import { defineAgent } from "@flue/runtime";
import { competitorAnalysisInstructions } from "../lib/agents/competitor-analysis/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: competitorAnalysisInstructions
}));
