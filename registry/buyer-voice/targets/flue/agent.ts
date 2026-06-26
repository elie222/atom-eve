import { defineAgent } from "@flue/runtime";
import { draftCopy } from "../tools/buyer-voice/voice.js";
import { buyerVoiceInstructions } from "../lib/agents/buyer-voice/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: buyerVoiceInstructions,
  tools: [draftCopy]
}));
