import { defineAgent } from "@flue/runtime";
import { reviewInboxTool } from "../tools/inbox-triage/gmail.js";
import { inboxTriageInstructions } from "../lib/agents/inbox-triage/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: inboxTriageInstructions,
  tools: [reviewInboxTool]
}));
