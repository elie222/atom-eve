import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/facebook-ads.js";
import { dailyLoopPrompt } from "../lib/agents/facebook-ads/schedule.js";

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
    return session.prompt(dailyLoopPrompt);
  }
});
