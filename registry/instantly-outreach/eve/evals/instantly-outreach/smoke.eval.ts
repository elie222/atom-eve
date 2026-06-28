import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  instantlyOutreachSmokePrompt,
  requiredReplyPatterns
} from "../fixtures/instantly-outreach-smoke.js";

export default defineEval({
  description:
    "Verifies the Instantly outreach agent reads leads and analytics via review_outreach and returns a draft-first cold-email sequence.",
  tags: ["smoke", "instantly-outreach"],
  async test(t) {
    await t.send(instantlyOutreachSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_outreach");
    t.check(t.reply, includes("Instantly"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
