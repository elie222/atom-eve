import { defineAgent } from "@flue/runtime";
import { reviewMessages } from "../tools/community-support/discord.js";

export default defineAgent(() => ({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewMessages]
}));
