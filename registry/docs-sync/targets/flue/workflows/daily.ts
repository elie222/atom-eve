import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/docs-sync.js";
import { dailyDocsSyncPrompt } from "../lib/agents/docs-sync/schedule.js";

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
    return session.prompt(dailyDocsSyncPrompt);
  }
});
