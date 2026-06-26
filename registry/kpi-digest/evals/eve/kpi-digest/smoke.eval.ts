import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  kpiDigestSmokePrompt,
  posthogCliCommandPattern,
  requiredReplyPatterns
} from "../shared/kpi-digest-smoke.js";

export default defineEval({
  description:
    "Verifies the KPI digest agent reads revenue KPIs via its Stripe tool and product KPIs via posthog-cli in the sandbox, then returns a combined read-only digest.",
  tags: ["smoke", "kpi-digest"],
  async test(t) {
    await t.send(kpiDigestSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_revenue");
    t.calledTool("bash", { input: { command: posthogCliCommandPattern } });
    t.check(t.reply, includes("KPI"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
