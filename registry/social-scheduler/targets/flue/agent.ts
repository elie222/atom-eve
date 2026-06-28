import { defineAgent } from "@flue/runtime";
import { reviewQueue } from "../tools/social-scheduler/ayrshare.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewQueue]
}));
