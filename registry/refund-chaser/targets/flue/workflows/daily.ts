import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/refund-chaser.js";
import { dailyChasePrompt } from "../lib/agents/refund-chaser/prompts.js";

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
    return session.prompt(dailyChasePrompt);
  }
});
