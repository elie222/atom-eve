import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/visual-regression.js";
import { weeklyVisualRegressionPrompt } from "../lib/agents/visual-regression/prompts.js";

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
    return session.prompt(weeklyVisualRegressionPrompt);
  }
});
