import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Researches keywords with search volume and difficulty and clusters them into a prioritized content map."
});
