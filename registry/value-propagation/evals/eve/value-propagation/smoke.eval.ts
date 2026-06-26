import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { valuePropagationSmokePrompt, expectedReplyPattern } from "../shared/value-propagation-smoke.js";

export default defineEval({
  description:
    "Verifies the value propagation agent plans a read-only audit and fix plan for a changed value via the planner tool.",
  tags: ["smoke", "value-propagation"],
  async test(t) {
    await t.send(valuePropagationSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("plan_propagation");
    t.check(t.reply, includes("plan"));
    t.messageIncludes(expectedReplyPattern);
  }
});
