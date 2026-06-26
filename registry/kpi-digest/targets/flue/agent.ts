import { defineAgent } from "@flue/runtime";
import { reviewRevenue } from "../tools/kpi-digest/revenue.js";
import { kpiDigestInstructions } from "../lib/agents/kpi-digest/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: kpiDigestInstructions,
  tools: [reviewRevenue]
}));
