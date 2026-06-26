import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/reviews-harvester.js";
import { weeklyReviewsPrompt } from "../lib/agents/reviews-harvester/prompts.js";

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
    return session.prompt(weeklyReviewsPrompt);
  }
});
