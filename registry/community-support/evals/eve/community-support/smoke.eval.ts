import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  communitySupportSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../shared/community-support-smoke.js";

export default defineEval({
  description:
    "Verifies the community support agent reads the channel via its review tool and returns draft-first, escalation-aware replies.",
  tags: ["smoke", "community-support"],
  async test(t) {
    await t.send(communitySupportSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_messages");
    t.check(t.reply, includes("Discord"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
