import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/onboarding-tester.js";
import { weeklyOnboardingTesterPrompt } from "../lib/agents/onboarding-tester/schedule.js";

interface WorkflowContext {
  harness: {
    session(): Promise<{
      prompt(message: string): Promise<unknown>;
    }>;
  };
}

export default defineWorkflow({
  agent,
  async run({ harness }: WorkflowContext) {
    const session = await harness.session();
    return session.prompt(weeklyOnboardingTesterPrompt);
  }
});
