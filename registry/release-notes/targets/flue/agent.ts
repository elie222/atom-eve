import { defineAgent } from "@flue/runtime";
import { reviewMerged } from "../tools/release-notes/github.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewMerged]
}));
