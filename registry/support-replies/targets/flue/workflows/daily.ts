import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/support-replies.js";
import { dailyReviewPrompt } from "../lib/agents/support-replies/prompts.js";

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
    return session.prompt(dailyReviewPrompt);
  }
});
