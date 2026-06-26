import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Turns approved content briefs into a draft schedule of posts across X and LinkedIn via Ayrshare for operator approval."
});
