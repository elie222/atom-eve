import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/email-resend.js";
import { weeklyEmailPrompt } from "../lib/agents/email-resend/schedule.js";

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
    return session.prompt(weeklyEmailPrompt);
  }
});
