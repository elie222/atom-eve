import { defineAgent } from "@flue/runtime";
import { perfAuditorInstructions } from "../lib/agents/perf-auditor/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: perfAuditorInstructions
}));
