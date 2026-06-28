import { defineAgent } from "@flue/runtime";
import { reviewUpdates } from "../tools/standup-bot/slack.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewUpdates]
}));
