import { defineAgent } from "@flue/runtime";
import { reviewMessages } from "../tools/community-support/discord.js";
import { communitySupportInstructions } from "../lib/agents/community-support/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: communitySupportInstructions,
  tools: [reviewMessages]
}));
