import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { dataComplianceSmokePrompt, expectedReplyPattern } from "../shared/data-compliance-smoke.js";

export default defineEval({
  description:
    "Verifies the data compliance agent drafts a read-only scan for disallowed and PII data plus the guards to prevent recurrence.",
  tags: ["smoke", "data-compliance"],
  async test(t) {
    await t.send(dataComplianceSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("plan_compliance_scan");
    t.check(t.reply, includes("draft"));
    t.messageIncludes(expectedReplyPattern);
  }
});
