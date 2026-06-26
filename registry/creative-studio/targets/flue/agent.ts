import { defineAgent } from "@flue/runtime";
import { generateCreative } from "../tools/creative-studio/fal.js";
import { creativeStudioInstructions } from "../lib/agents/creative-studio/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: creativeStudioInstructions,
  tools: [generateCreative]
}));
