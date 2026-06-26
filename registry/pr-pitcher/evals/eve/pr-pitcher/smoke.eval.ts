import { defineEval } from "eve/evals";
import {
  draftPitchToolName,
  expectedReplyPatterns,
  prPitcherSmokePrompt
} from "../shared/pr-pitcher-smoke.js";

export default defineEval({
  description:
    "Verifies the PR Pitcher agent calls the draft_pitch planner and returns a draft-first quotable response.",
  tags: ["smoke", "pr-pitcher"],
  async test(t) {
    await t.send(prPitcherSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool(draftPitchToolName);

    for (const pattern of expectedReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
