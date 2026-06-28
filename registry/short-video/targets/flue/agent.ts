import { defineAgent } from "@flue/runtime";
import { planClips } from "../tools/short-video/fal.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [planClips]
}));
