import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  thumbnailStudioSmokePrompt,
  thumbnailToolName
} from "../fixtures/thumbnail-studio-smoke.js";

export default defineEval({
  description:
    "Verifies the Thumbnail Studio agent generates concepts with the fal.ai tool and returns self-scored, draft-first results.",
  tags: ["smoke", "thumbnail-studio"],
  async test(t) {
    await t.send(thumbnailStudioSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool(thumbnailToolName);
    t.check(t.reply, includes("sourdough"));
    t.messageIncludes(expectedReplyToken);
  }
});
