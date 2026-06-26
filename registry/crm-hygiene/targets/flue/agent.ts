import { defineAgent } from "@flue/runtime";
import { reviewContacts } from "../tools/crm-hygiene/hubspot.js";
import { crmHygieneInstructions } from "../lib/agents/crm-hygiene/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: crmHygieneInstructions,
  tools: [reviewContacts]
}));
