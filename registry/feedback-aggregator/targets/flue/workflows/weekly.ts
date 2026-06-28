import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/feedback-aggregator.js";
import { weeklyFeedbackPrompt } from "../lib/agents/feedback-aggregator/schedule.js";

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
    return session.prompt(weeklyFeedbackPrompt);
  }
});
