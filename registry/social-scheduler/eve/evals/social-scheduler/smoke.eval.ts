import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedApprovalToken,
  socialSchedulerSmokePrompt
} from "../fixtures/social-scheduler-smoke.js";

export default defineEval({
  description:
    "Verifies the Social Scheduler agent reads the Ayrshare queue and returns a draft posting plan for approval.",
  tags: ["smoke", "social-scheduler"],
  async test(t) {
    await t.send(socialSchedulerSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_queue");
    t.check(t.reply, includes("plan"));
    t.messageIncludes(expectedApprovalToken);
  }
});
