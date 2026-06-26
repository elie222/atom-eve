import { defineAgent } from "@flue/runtime";
import { planEpisode } from "../tools/product-podcast/podcast.js";
import { productPodcastInstructions } from "../lib/agents/product-podcast/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: productPodcastInstructions,
  tools: [planEpisode]
}));
