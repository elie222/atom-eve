import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  requiredReplyPatterns,
  revenueDigestSmokePrompt
} from "../shared/revenue-digest-smoke.js";

export default defineEval({
  description:
    "Verifies the Revenue Digest agent reads Stripe via its review tool and returns a read-only weekly digest.",
  tags: ["smoke", "revenue-digest"],
  async test(t) {
    await t.send(revenueDigestSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_revenue");
    t.check(t.reply, includes("MRR"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
