import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/backup-verifier.js";
import { weeklyRestoreCheckPrompt } from "../lib/agents/backup-verifier/schedule.js";

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
    return session.prompt(weeklyRestoreCheckPrompt);
  }
});
