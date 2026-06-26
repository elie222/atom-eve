import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/content-ideation.js";
import { CONTENT_IDEATION_WEEKLY_PROMPT } from "../lib/agents/content-ideation/prompts.js";

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
    return session.prompt(CONTENT_IDEATION_WEEKLY_PROMPT);
  }
});
