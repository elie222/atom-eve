import { defineAgent } from "@flue/runtime";
import { onboardingTesterInstructions } from "../lib/agents/onboarding-tester/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: onboardingTesterInstructions
}));
