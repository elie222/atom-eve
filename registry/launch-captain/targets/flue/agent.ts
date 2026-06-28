import { defineAgent } from "@flue/runtime";
import { planLaunch } from "../tools/launch-captain/launch.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [planLaunch]
}));
