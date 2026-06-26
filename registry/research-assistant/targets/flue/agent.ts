import { defineAgent } from "@flue/runtime";
import { researchAssistantInstructions } from "../lib/agents/research-assistant/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: researchAssistantInstructions
}));
