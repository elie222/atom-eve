import { defineEval } from "eve/evals";
import {
  blogWriterEveToolName,
  blogWriterReplyPattern,
  blogWriterSmokePrompt
} from "../shared/blog-writer-smoke.js";

export default defineEval({
  description:
    "Verifies the Blog Writer agent calls its planner and returns a draft-first article plan from a keyword brief.",
  tags: ["smoke", "blog-writer"],
  async test(t) {
    await t.send(blogWriterSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool(blogWriterEveToolName);
    t.messageIncludes(blogWriterReplyPattern);
  }
});
