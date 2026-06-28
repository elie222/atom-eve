import { defineAgent } from "@flue/runtime";
import { generateThumbnails } from "../tools/thumbnail-studio/fal.js";

export default defineAgent(() => ({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [generateThumbnails]
}));
