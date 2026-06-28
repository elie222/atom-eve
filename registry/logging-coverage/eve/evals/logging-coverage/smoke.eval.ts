import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { loggingCoverageSmokePrompt, expectedReplyPattern } from "../fixtures/logging-coverage-smoke.js";

export default defineEval({
  description:
    "Verifies the logging coverage agent uses the planner tool and drafts structured log statements for operator approval.",
  tags: ["smoke", "logging-coverage"],
  async test(t) {
    await t.send(loggingCoverageSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("plan_logging");
    t.check(t.reply, includes("draft"));
    t.messageIncludes(expectedReplyPattern);
  }
});
