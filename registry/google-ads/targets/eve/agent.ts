import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reviews Google Ads performance and recommends conservative budget, keyword, and negative-keyword actions."
});
