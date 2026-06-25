import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
  description:
    "Runs weekly competitor URL analysis using native browser, fetch, and sandbox capabilities, then reports positioning, pricing, messaging, CTA, content, screenshot, and history deltas."
});
