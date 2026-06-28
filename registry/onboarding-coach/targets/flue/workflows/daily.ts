import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/onboarding-coach.js";
import { dailyNudgePrompt } from "../lib/agents/onboarding-coach/schedule.js";

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
    return session.prompt(dailyNudgePrompt);
  }
});
