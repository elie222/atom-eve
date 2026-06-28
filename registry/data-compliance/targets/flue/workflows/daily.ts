import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/data-compliance.js";
import { dailyScanPrompt } from "../lib/agents/data-compliance/schedule.js";

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
    return session.prompt(dailyScanPrompt);
  }
});
