import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/inbox-triage.js";
import { dailyTriagePrompt } from "../lib/agents/inbox-triage/schedule.js";

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
    return session.prompt(dailyTriagePrompt);
  }
});
