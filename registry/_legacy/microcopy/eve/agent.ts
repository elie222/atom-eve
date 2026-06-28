import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Rewrites in-product copy, empty states, errors, tooltips, and labels for clarity and a consistent brand voice, presenting every rewrite as a draft for operator approval."
});
