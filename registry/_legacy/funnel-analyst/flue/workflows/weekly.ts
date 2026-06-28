import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/funnel-analyst.js";
import { weeklyFunnelPrompt } from "../lib/agents/funnel-analyst/schedule.js";

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
    return session.prompt(weeklyFunnelPrompt);
  }
});
