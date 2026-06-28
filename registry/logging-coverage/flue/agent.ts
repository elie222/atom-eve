import { defineAgent } from "@flue/runtime";
import { planLogging } from "../tools/logging-coverage/logging.js";

export default defineAgent(() => ({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [planLogging]
}));
