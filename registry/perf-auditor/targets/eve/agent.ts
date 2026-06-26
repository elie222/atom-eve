import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Runs weekly browser-driven performance audits using native browser and sandbox capabilities, measures load timings and transfer weight, identifies the single worst bottleneck, and proposes one behavior-preserving fix."
});
