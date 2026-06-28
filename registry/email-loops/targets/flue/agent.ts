import { defineAgent } from "@flue/runtime";
import { reviewAudience } from "../tools/email-loops/loops.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewAudience]
}));
