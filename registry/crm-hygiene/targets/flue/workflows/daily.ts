import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/crm-hygiene.js";
import { dailyLoopPrompt } from "../lib/agents/crm-hygiene/schedule.js";

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
