import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Scans HubSpot contacts for duplicates, missing fields, and stale records and returns a cleanup report."
});
