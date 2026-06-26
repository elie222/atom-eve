import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  agentBrowserCommandPattern,
  croOptimizerSmokePrompt,
  requiredReportSectionPatterns
} from "../shared/cro-optimizer-smoke.js";

export default defineEval({
  description:
    "Verifies the CRO Optimizer agent uses browser automation and returns the expected Markdown report shape with ranked A/B test ideas.",
  tags: ["smoke", "cro-optimizer"],
  async test(t) {
    await t.send(croOptimizerSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: agentBrowserCommandPattern } });
    t.check(t.reply, includes("example.com"));

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
