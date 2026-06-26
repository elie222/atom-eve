import { defineAgent } from "@flue/runtime";
import { draftPitch } from "../tools/pr-pitcher/pitcher.js";
import { prPitcherInstructions } from "../lib/agents/pr-pitcher/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: prPitcherInstructions,
  tools: [draftPitch]
}));
