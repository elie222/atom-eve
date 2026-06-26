import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Walks a real user task in the browser, scores each screen on usability, and recommends read-only improvements to the weakest spots."
});
