import { defineAgent } from "@flue/runtime";
import { CONTENT_IDEATION_AGENT_INSTRUCTIONS } from "../lib/agents/content-ideation/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: CONTENT_IDEATION_AGENT_INSTRUCTIONS
}));
