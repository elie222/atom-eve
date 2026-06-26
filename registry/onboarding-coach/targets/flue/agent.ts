import { defineAgent } from "@flue/runtime";
import { reviewActivation } from "../tools/onboarding-coach/posthog.js";
import { onboardingCoachInstructions } from "../lib/agents/onboarding-coach/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: onboardingCoachInstructions,
  tools: [reviewActivation]
}));
