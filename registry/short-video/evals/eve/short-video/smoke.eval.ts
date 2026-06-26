import { defineEval } from "eve/evals";
import {
  expectedReplyPattern,
  shortVideoSmokePrompt
} from "../shared/short-video-smoke.js";

export default defineEval({
  description:
    "Verifies the Short Video agent calls the clip planner and returns draft clips with hooks.",
  tags: ["smoke", "short-video"],
  async test(t) {
    await t.send(shortVideoSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("plan_clips");
    t.messageIncludes(expectedReplyPattern);
  }
});
