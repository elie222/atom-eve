import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  draftApprovalPattern,
  redditRadarSmokePrompt,
  redditRadarToolName
} from "../shared/reddit-radar-smoke.js";

export default defineEval({
  description:
    "Verifies the Reddit Radar agent searches target threads and returns draft replies for operator approval.",
  tags: ["smoke", "reddit-radar"],
  async test(t) {
    await t.send(redditRadarSmokePrompt);

    t.completed();
    t.calledTool(redditRadarToolName);
    t.check(t.reply, includes("Reddit"));
    t.messageIncludes(draftApprovalPattern);
  }
});
