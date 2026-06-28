import { defineAgent } from "@flue/runtime";
import { reviewDependencies } from "../tools/dep-guardian/github.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewDependencies]
}));
