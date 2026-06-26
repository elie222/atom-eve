import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  funnelAnalystSmokePrompt,
  requiredReplyPatterns
} from "../shared/funnel-analyst-smoke.js";

export default defineEval({
  description:
    "Verifies the Funnel Analyst agent reviews PostHog funnels via its review tool and returns a read-only recommendation.",
  tags: ["smoke", "funnel-analyst"],
  async test(t) {
    await t.send(funnelAnalystSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_funnels");
    t.check(t.reply, includes("PostHog"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
