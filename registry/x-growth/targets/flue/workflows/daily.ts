import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/x-growth.js";
import { dailyMentionsPrompt } from "../lib/agents/x-growth/prompts.js";

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
    return session.prompt(dailyMentionsPrompt);
  }
});
