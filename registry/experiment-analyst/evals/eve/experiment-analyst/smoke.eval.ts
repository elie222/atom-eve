import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  experimentAnalystSmokePrompt,
  requiredReplyPatterns
} from "../shared/experiment-analyst-smoke.js";

export default defineEval({
  description:
    "Verifies the Experiment Analyst agent reads PostHog experiments via its review tool and returns a read-only summary.",
  tags: ["smoke", "experiment-analyst"],
  async test(t) {
    await t.send(experimentAnalystSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_experiments");
    t.check(t.reply, includes("experiment"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
