import { defineAgent } from "@flue/runtime";
import { reviewLeads } from "../tools/lead-router/hubspot.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewLeads]
}));
