import { defineAgent } from "@flue/runtime";
import { planFollowup } from "../tools/deal-followup/followup.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [planFollowup]
}));
