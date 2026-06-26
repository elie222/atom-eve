import { defineAgent } from "@flue/runtime";
import { findThreads } from "../tools/reddit-radar/reddit.js";
import { redditRadarInstructions } from "../lib/agents/reddit-radar/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: redditRadarInstructions,
  tools: [findThreads]
}));
