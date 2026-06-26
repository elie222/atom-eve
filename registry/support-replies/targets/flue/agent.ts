import { defineAgent } from "@flue/runtime";
import { reviewConversations } from "../tools/support-replies/intercom.js";
import { supportRepliesInstructions } from "../lib/agents/support-replies/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: supportRepliesInstructions,
  tools: [reviewConversations]
}));
