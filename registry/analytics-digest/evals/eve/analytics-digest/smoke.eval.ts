import { defineEval } from "eve/evals";
import {
  analyticsDigestSmokePrompt,
  expectedReplyToken,
  posthogCliCommandPattern
} from "../shared/analytics-digest-smoke.js";

export default defineEval({
  description:
    "Verifies the analytics digest agent reads PostHog trends via the posthog-cli in the sandbox and returns a plain-language weekly digest.",
  tags: ["smoke", "analytics-digest"],
  async test(t) {
    await t.send(analyticsDigestSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: posthogCliCommandPattern } });
    t.messageIncludes(expectedReplyToken);
  }
});
