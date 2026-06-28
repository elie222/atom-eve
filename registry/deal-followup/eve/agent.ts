import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Turns a sales-call transcript into a recap email, extracted next steps, and draft CRM field updates for operator approval."
});
