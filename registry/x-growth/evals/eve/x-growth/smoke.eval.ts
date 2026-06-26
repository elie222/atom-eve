import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { expectedApprovalToken, xGrowthSmokePrompt } from "../shared/x-growth-smoke.js";

export default defineEval({
  description:
    "Verifies the X Growth agent searches recent mentions and returns draft replies and post ideas for approval.",
  tags: ["smoke", "x-growth"],
  async test(t) {
    await t.send(xGrowthSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("search_mentions");
    t.check(t.reply, includes("draft"));
    t.messageIncludes(expectedApprovalToken);
  }
});
