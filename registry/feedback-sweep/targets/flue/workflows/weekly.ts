import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/feedback-sweep.js";
import { weeklySweepPrompt } from "../lib/agents/feedback-sweep/prompts.js";

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
    return session.prompt(weeklySweepPrompt);
  }
});
