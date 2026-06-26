import { defineAgent } from "@flue/runtime";
import { seoAuditFlueAgentInstructions } from "../lib/agents/seo-audit/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: seoAuditFlueAgentInstructions
}));
