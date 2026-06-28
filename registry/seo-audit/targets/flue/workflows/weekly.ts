import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/seo-audit.js";
import { seoAuditFlueRunPrompt } from "../lib/agents/seo-audit/schedule.js";

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
    return session.prompt(seoAuditFlueRunPrompt);
  }
});
