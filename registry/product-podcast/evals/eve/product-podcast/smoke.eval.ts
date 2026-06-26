import { defineEval } from "eve/evals";
import {
  draftReplyPatterns,
  planEpisodeToolName,
  productPodcastSmokePrompt
} from "../shared/product-podcast-smoke.js";

export default defineEval({
  description:
    "Verifies the Product Podcast agent plans an episode from update notes and returns a draft-first script.",
  tags: ["smoke", "product-podcast"],
  async test(t) {
    await t.send(productPodcastSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool(planEpisodeToolName);

    for (const pattern of draftReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
