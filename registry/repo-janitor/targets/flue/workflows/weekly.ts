import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/repo-janitor.js";
import { weeklyCleanupPrompt } from "../lib/agents/repo-janitor/schedule.js";

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
    return session.prompt(weeklyCleanupPrompt);
  }
});
