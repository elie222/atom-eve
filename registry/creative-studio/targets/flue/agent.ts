import { defineAgent } from "@flue/runtime";
import { generateCreative } from "../tools/creative-studio/fal.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [generateCreative]
}));
