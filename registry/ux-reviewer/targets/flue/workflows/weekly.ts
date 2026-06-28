import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/ux-reviewer.js";
import { weeklyUxReviewPrompt } from "../lib/agents/ux-reviewer/schedule.js";

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
    return session.prompt(weeklyUxReviewPrompt);
  }
});
