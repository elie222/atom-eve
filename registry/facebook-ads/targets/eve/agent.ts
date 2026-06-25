import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
  description: "Reviews Facebook Ads performance and recommends daily optimization actions."
});
