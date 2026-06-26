import { defineAgent } from "@flue/runtime";
import { generateThumbnails } from "../tools/thumbnail-studio/fal.js";
import { thumbnailStudioInstructions } from "../lib/agents/thumbnail-studio/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: thumbnailStudioInstructions,
  tools: [generateThumbnails]
}));
