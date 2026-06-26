import { defineAgent } from "@flue/runtime";
import { planScan } from "../tools/data-compliance/compliance.js";
import { dataComplianceInstructions } from "../lib/agents/data-compliance/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: dataComplianceInstructions,
  tools: [planScan]
}));
