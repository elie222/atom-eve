import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  meetingNotesSmokePrompt,
  requiredReplyPatterns
} from "../shared/meeting-notes-smoke.js";

export default defineEval({
  description:
    "Verifies the Meeting Notes agent reads a transcript via its review tool and returns a draft-first recap with decisions and action items.",
  tags: ["smoke", "meeting-notes"],
  async test(t) {
    await t.send(meetingNotesSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_transcript");
    t.check(t.reply, includes("meeting"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
