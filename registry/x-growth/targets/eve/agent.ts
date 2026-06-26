import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Monitors brand and keyword mentions on X and drafts engagement replies and original post ideas for operator approval."
});
