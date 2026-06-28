import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/pr-pitcher.js";
import { dailyPitchPrompt } from "../lib/agents/pr-pitcher/schedule.js";

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
    return session.prompt(dailyPitchPrompt);
  }
});
