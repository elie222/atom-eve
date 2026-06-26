import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/winback.js";
import { weeklyWinbackPrompt } from "../lib/agents/winback/prompts.js";

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
    return session.prompt(weeklyWinbackPrompt);
  }
});
