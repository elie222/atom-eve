import { defineAgent } from "@flue/runtime";
import { reviewQueue } from "../tools/social-scheduler/ayrshare.js";
import { socialSchedulerInstructions } from "../lib/agents/social-scheduler/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: socialSchedulerInstructions,
  tools: [reviewQueue]
}));
