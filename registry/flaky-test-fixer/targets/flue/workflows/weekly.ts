import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/flaky-test-fixer.js";
import { weeklyReviewPrompt } from "../lib/agents/flaky-test-fixer/prompts.js";

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
    return session.prompt(weeklyReviewPrompt);
  }
});
