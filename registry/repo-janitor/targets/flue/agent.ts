import { defineAgent } from "@flue/runtime";
import { planCleanup } from "../tools/repo-janitor/janitor.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [planCleanup]
}));
