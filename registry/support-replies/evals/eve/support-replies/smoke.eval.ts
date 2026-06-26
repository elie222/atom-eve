import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  requiredReplyPatterns,
  supportRepliesSmokePrompt
} from "../shared/support-replies-smoke.js";

export default defineEval({
  description:
    "Verifies the support replies agent reads conversations via its review tool and returns a draft-first reply.",
  tags: ["smoke", "support-replies"],
  async test(t) {
    await t.send(supportRepliesSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_conversations");
    t.check(t.reply, includes("Intercom"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
