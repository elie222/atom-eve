import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  refundChaserSmokePrompt,
  requiredReplyPatterns
} from "../shared/refund-chaser-smoke.js";

export default defineEval({
  description:
    "Verifies the refund chaser agent reads refunds and disputes via its review tool and returns a draft-first reply.",
  tags: ["smoke", "refund-chaser"],
  async test(t) {
    await t.send(refundChaserSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_refunds");
    t.check(t.reply, includes("Stripe"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
