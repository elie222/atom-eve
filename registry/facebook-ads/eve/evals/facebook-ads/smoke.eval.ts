import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  facebookAdsSmokePrompt,
  requiredReplyPatterns
} from "../fixtures/facebook-ads-smoke.js";

export default defineEval({
  description:
    "Verifies the Facebook Ads agent reviews campaign insights via its review tool and returns a read-only recommendation.",
  tags: ["smoke", "facebook-ads"],
  async test(t) {
    await t.send(facebookAdsSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_campaigns");
    t.check(t.reply, includes("Facebook"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
