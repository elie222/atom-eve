import { defineAgent } from "@flue/runtime";
import { planLaunch } from "../tools/launch-captain/launch.js";
import { launchCaptainInstructions } from "../lib/agents/launch-captain/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: launchCaptainInstructions,
  tools: [planLaunch]
}));
