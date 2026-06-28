import { defineAgent } from "@flue/runtime";
import { reviewInboxTool } from "../tools/inbox-triage/gmail.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewInboxTool]
}));
