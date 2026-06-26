import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/uptime-monitor.js";
import { frequentCheckPrompt } from "../lib/agents/uptime-monitor/prompts.js";

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
    return session.prompt(frequentCheckPrompt);
  }
});
