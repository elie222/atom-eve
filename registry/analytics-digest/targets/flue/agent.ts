import { defineAgent } from "@flue/runtime";
import { analyticsDigestInstructions } from "../lib/agents/analytics-digest/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: analyticsDigestInstructions
}));
