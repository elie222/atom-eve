import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/spend-tracker.js";
import { weeklySpendPrompt } from "../lib/agents/spend-tracker/schedule.js";

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
    return session.prompt(weeklySpendPrompt);
  }
});
