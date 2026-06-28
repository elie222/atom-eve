import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  dunningSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../fixtures/dunning-smoke.js";

export default defineEval({
  description:
    "Verifies the dunning agent reads Stripe via its review tool and returns draft-first recovery emails.",
  tags: ["smoke", "dunning"],
  async test(t) {
    await t.send(dunningSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_failed_payments");
    t.check(t.reply, includes("Stripe"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
