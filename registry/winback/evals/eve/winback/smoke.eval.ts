import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  requiredReplyPatterns,
  winbackSmokePrompt
} from "../shared/winback-smoke.js";

export default defineEval({
  description:
    "Verifies the Winback agent reads Stripe churn via its review tool and returns draft-first win-back offers.",
  tags: ["smoke", "winback"],
  async test(t) {
    await t.send(winbackSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_churn");
    t.check(t.reply, includes("Stripe"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
