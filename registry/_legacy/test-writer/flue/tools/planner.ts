import { planTests as buildTestPlan, normalizePlanTestsInput } from "../../lib/agents/test-writer/planner.js";

export async function planTests(input?: unknown) {
  return buildTestPlan(normalizePlanTestsInput(input));
}
