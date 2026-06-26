import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  requiredReplyPatterns,
  standupBotSmokePrompt
} from "../shared/standup-bot-smoke.js";

export default defineEval({
  description:
    "Verifies the standup bot reads channel updates via its review tool and returns a draft-first digest.",
  tags: ["smoke", "standup-bot"],
  async test(t) {
    await t.send(standupBotSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_updates");
    t.check(t.reply, includes("standup"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
