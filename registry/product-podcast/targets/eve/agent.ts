import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Turns recent product updates into a short, source-grounded podcast script and ElevenLabs audio plan for operator approval."
});
