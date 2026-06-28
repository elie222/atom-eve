import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/lead-router.js";
import { dailyRoutingPrompt } from "../lib/agents/lead-router/schedule.js";

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
    return session.prompt(dailyRoutingPrompt);
  }
});
