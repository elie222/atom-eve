import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reviews new Ashby applicants, scores them against a role, shortlists, and drafts outreach for operator approval."
});
