import { defineAgent } from "@flue/runtime";
import { reviewSentryErrors } from "../tools/error-triage/sentry.js";
import { errorTriageAgentInstructions } from "../lib/agents/error-triage/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: errorTriageAgentInstructions,
  tools: [reviewSentryErrors]
}));
