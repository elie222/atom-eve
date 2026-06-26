import { defineAgent } from "@flue/runtime";
import { findProspectsTool } from "../tools/link-builder/linkbuilder.js";
import { linkBuilderInstructions } from "../lib/agents/link-builder/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: linkBuilderInstructions,
  tools: [findProspectsTool]
}));
