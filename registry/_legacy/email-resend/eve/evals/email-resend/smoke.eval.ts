import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  emailResendSmokePrompt,
  expectedReplyToken,
  requiredDraftPatterns
} from "../fixtures/email-resend-smoke.js";

export default defineEval({
  description:
    "Verifies the Resend email agent reviews audience data and returns an approval-ready email draft.",
  tags: ["smoke", "email-resend"],
  async test(t) {
    await t.send(emailResendSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_audience");
    t.check(t.reply, includes("draft"));

    for (const pattern of requiredDraftPatterns) {
      t.messageIncludes(pattern);
    }

    t.messageIncludes(expectedReplyToken);
  }
});
