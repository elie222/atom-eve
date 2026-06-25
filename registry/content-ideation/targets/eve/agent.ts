import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
  description:
    "Generates YouTube topics, tweet/thread ideas, hooks, outlines, and approval-ready social copy from recent business context."
});
