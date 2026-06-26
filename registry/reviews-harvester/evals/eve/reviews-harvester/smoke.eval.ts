import { defineEval } from "eve/evals";
import {
  draftResponsesToolName,
  expectedReplyPatterns,
  reviewsHarvesterSmokePrompt
} from "../shared/reviews-harvester-smoke.js";

export default defineEval({
  description:
    "Verifies the Reviews Harvester agent calls the draft_responses planner and returns draft-first replies that flag detractors.",
  tags: ["smoke", "reviews-harvester"],
  async test(t) {
    await t.send(reviewsHarvesterSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool(draftResponsesToolName);

    for (const pattern of expectedReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
