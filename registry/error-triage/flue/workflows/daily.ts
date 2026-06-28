import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/error-triage.js";
import { dailyErrorTriagePrompt } from "../lib/agents/error-triage/schedule.js";

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
    return session.prompt(dailyErrorTriagePrompt);
  }
});
