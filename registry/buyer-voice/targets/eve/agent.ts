import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Mines buyer objections and drafts landing-page copy in customers' own words for operator approval."
});
