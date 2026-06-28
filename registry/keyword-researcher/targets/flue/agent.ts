import { defineAgent } from "@flue/runtime";
import { researchKeywordsTool } from "../tools/keyword-researcher/dataforseo.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [researchKeywordsTool]
}));
