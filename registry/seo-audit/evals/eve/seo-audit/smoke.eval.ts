import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  requiredReportSectionPatterns,
  seoAuditSmokePrompt
} from "../shared/seo-audit-smoke.js";

export default defineEval({
  description:
    "Verifies the SEO Audit agent uses native sandbox commands and returns the expected Markdown report shape.",
  tags: ["smoke", "seo-audit"],
  async test(t) {
    await t.send(seoAuditSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("bash");
    t.check(t.reply, includes(expectedReplyToken));
    t.messageIncludes(expectedReplyToken);

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
