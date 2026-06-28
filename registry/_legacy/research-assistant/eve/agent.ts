import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Turns a focused question into a sourced, cited brief for a real decision using native web search and fetch, with adversarial source verification and no paid search APIs."
});
