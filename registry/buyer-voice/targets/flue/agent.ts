import { defineAgent } from "@flue/runtime";
import { draftCopy } from "../tools/buyer-voice/voice.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [draftCopy]
}));
