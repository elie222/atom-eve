import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reads recent inbound HubSpot contacts and drafts lead scoring, owner assignment, and first-touch outreach for operator approval."
});
