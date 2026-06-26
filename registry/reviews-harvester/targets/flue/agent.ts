import { defineAgent } from "@flue/runtime";
import { draftResponses } from "../tools/reviews-harvester/reviews.js";
import { reviewsHarvesterInstructions } from "../lib/agents/reviews-harvester/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: reviewsHarvesterInstructions,
  tools: [draftResponses]
}));
