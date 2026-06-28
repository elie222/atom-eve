import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/standup-bot.js";
import { dailyStandupPrompt } from "../lib/agents/standup-bot/schedule.js";

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
    return session.prompt(dailyStandupPrompt);
  }
});
