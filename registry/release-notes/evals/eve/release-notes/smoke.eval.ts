import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  releaseNotesSmokePrompt,
  requiredReplyPatterns
} from "../shared/release-notes-smoke.js";

export default defineEval({
  description:
    "Verifies the release notes agent reads merged pull requests via its review tool and returns a draft-first reply.",
  tags: ["smoke", "release-notes"],
  async test(t) {
    await t.send(releaseNotesSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_merged");
    t.check(t.reply, includes("release notes"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
