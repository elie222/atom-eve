import { defineAgent } from "@flue/runtime";
import { planTests } from "../tools/test-writer/planner.js";
import { testWriterInstructions } from "../lib/agents/test-writer/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: testWriterInstructions,
  tools: [planTests]
}));
