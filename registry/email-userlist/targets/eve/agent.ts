import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Plans lifecycle, event-driven Userlist email campaigns and drafts message copy and an event/trait push plan for operator approval."
});
