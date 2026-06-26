import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { repoJanitorSmokePrompt, expectedReplyPattern } from "../shared/repo-janitor-smoke.js";

export default defineEval({
  description:
    "Verifies the repo janitor agent plans proven low-risk cleanups and drafts them for operator approval.",
  tags: ["smoke", "repo-janitor"],
  async test(t) {
    await t.send(repoJanitorSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("plan_cleanup");
    t.check(t.reply, includes("draft"));
    t.messageIncludes(expectedReplyPattern);
  }
});
