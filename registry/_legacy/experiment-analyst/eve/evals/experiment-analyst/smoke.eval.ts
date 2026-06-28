import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  experimentAnalystSmokePrompt,
  posthogCliCommandPattern,
  requiredReplyPatterns
} from "../fixtures/experiment-analyst-smoke.js";

export default defineEval({
  description:
    "Verifies the Experiment Analyst agent reads PostHog experiments via the posthog-cli sandbox command and returns a read-only summary.",
  tags: ["smoke", "experiment-analyst"],
  async test(t) {
    await t.send(experimentAnalystSmokePrompt);

    t.succeeded();
    t.calledTool("bash", { input: { command: posthogCliCommandPattern } });
    t.check(t.reply, includes("experiment"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
