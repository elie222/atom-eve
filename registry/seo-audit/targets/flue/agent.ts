import { defineAgent } from "@flue/runtime";
import { seoAuditAgentInstructions } from "../lib/agents/seo-audit/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: seoAuditAgentInstructions
}));
