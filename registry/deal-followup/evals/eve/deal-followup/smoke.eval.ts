import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { dealFollowupSmokePrompt, expectedReplyPattern } from "../shared/deal-followup-smoke.js";

export default defineEval({
  description:
    "Verifies the deal follow-up agent parses the transcript and drafts a recap email, next steps, and CRM field updates for operator approval.",
  tags: ["smoke", "deal-followup"],
  async test(t) {
    await t.send(dealFollowupSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("plan_followup");
    t.check(t.reply, includes("draft"));
    t.messageIncludes(expectedReplyPattern);
  }
});
