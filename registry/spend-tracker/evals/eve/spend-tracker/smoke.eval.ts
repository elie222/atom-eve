import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  requiredReplyPatterns,
  spendTrackerSmokePrompt
} from "../shared/spend-tracker-smoke.js";

export default defineEval({
  description:
    "Verifies the Spend Tracker agent reads charges via its review tool and returns a categorized, read-only spend report.",
  tags: ["smoke", "spend-tracker"],
  async test(t) {
    await t.send(spendTrackerSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_spend");
    t.check(t.reply, includes("spend"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
