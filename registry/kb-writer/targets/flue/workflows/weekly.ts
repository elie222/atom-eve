import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/kb-writer.js";
import { weeklyKbPrompt } from "../lib/agents/kb-writer/prompts.js";

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
    return session.prompt(weeklyKbPrompt);
  }
});
