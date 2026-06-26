import { defineAgent } from "@flue/runtime";
import { reviewFunnels } from "../tools/funnel-analyst/posthog.js";
import { funnelAnalystInstructions } from "../lib/agents/funnel-analyst/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: funnelAnalystInstructions,
  tools: [reviewFunnels]
}));
