import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/community-support.js";
import { dailyTriagePrompt } from "../lib/agents/community-support/prompts.js";

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
