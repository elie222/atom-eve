import { defineAgent } from "@flue/runtime";
import { a11yAuditorInstructions } from "../lib/agents/a11y-auditor/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: a11yAuditorInstructions
}));
