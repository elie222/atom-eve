import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/experiment-analyst.js";
import { weeklyLoopPrompt } from "../lib/agents/experiment-analyst/schedule.js";

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
    return session.prompt(weeklyLoopPrompt);
  }
});
