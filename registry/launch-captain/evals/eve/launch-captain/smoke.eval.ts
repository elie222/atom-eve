import { defineEval } from "eve/evals";
import {
  expectedReplyPatterns,
  launchCaptainSmokePrompt,
  planLaunchToolName
} from "../shared/launch-captain-smoke.js";

export default defineEval({
  description:
    "Verifies the Launch Captain agent calls the plan_launch planner and returns a draft-first launch playbook.",
  tags: ["smoke", "launch-captain"],
  async test(t) {
    await t.send(launchCaptainSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool(planLaunchToolName);

    for (const pattern of expectedReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
