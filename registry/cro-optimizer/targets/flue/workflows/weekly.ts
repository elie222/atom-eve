import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/cro-optimizer.js";
import { weeklyCroOptimizerPrompt } from "../lib/agents/cro-optimizer/prompts.js";

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
    return session.prompt(weeklyCroOptimizerPrompt);
  }
});
