import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/instantly-outreach.js";
import { outreachLoopPrompt } from "../lib/agents/instantly-outreach/prompts.js";

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
    return session.prompt(outreachLoopPrompt);
  }
});
