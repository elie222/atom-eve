import { defineAgent } from "@flue/runtime";
import { planLogging } from "../tools/logging-coverage/logging.js";
import { loggingCoverageInstructions } from "../lib/agents/logging-coverage/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: loggingCoverageInstructions,
  tools: [planLogging]
}));
