import { defineAgent } from "@flue/runtime";
import { reviewRevenue } from "../tools/kpi-digest/revenue.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewRevenue]
}));
