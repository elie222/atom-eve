import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { expectedReplyPattern, googleAdsSmokePrompt } from "../shared/google-ads-smoke.js";

export default defineEval({
  description:
    "Verifies the Google Ads agent reviews campaign performance and returns recommended actions.",
  tags: ["smoke", "google-ads"],
  async test(t) {
    await t.send(googleAdsSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_campaigns");
    t.check(t.reply, includes("campaign"));
    t.messageIncludes(expectedReplyPattern);
  }
});
