import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  competitorAnalysisSmokePrompt,
  expectedUrlToken,
  requiredReportSectionPatterns,
  sandboxCommandPattern
} from "../shared/competitor-analysis-smoke.js";

export default defineEval({
  description:
    "Verifies the Competitor Analysis agent uses native browser/sandbox capabilities and returns the expected Markdown report shape.",
  tags: ["smoke", "competitor-analysis"],
  async test(t) {
    await t.send(competitorAnalysisSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: sandboxCommandPattern } });
    t.check(t.reply, includes(expectedUrlToken));

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
