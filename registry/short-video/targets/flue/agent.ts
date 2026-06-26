import { defineAgent } from "@flue/runtime";
import { planClips } from "../tools/short-video/fal.js";
import { shortVideoInstructions } from "../lib/agents/short-video/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: shortVideoInstructions,
  tools: [planClips]
}));
