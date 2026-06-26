import { defineAgent } from "@flue/runtime";
import { reviewKpis } from "../tools/kpi-digest/kpi.js";
import { kpiDigestInstructions } from "../lib/agents/kpi-digest/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: kpiDigestInstructions,
  tools: [reviewKpis]
}));
