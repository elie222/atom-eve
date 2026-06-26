import { defineEval } from "eve/evals";
import {
  microcopyEveToolName,
  microcopyReplyPattern,
  microcopySmokePrompt
} from "../shared/microcopy-smoke.js";

export default defineEval({
  description:
    "Verifies the Microcopy agent flags clarity and voice issues via its planner and returns draft-first copy rewrites for operator approval.",
  tags: ["smoke", "microcopy"],
  async test(t) {
    await t.send(microcopySmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool(microcopyEveToolName);
    t.messageIncludes(microcopyReplyPattern);
  }
});
