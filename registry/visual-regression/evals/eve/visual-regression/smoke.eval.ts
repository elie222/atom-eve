import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  agentBrowserCommandPattern,
  requiredReportSectionPatterns,
  visualRegressionSmokePrompt
} from "../shared/visual-regression-smoke.js";

export default defineEval({
  description:
    "Verifies the Visual Regression agent uses browser automation and returns the expected Markdown diff report shape.",
  tags: ["smoke", "visual-regression"],
  async test(t) {
    await t.send(visualRegressionSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: agentBrowserCommandPattern } });
    t.check(t.reply, includes("example.com"));

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
