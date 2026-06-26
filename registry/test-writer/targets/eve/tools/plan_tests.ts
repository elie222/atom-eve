import { defineTool } from "eve/tools";
import { planTests, planTestsInputSchema, normalizePlanTestsInput } from "../lib/planner.js";

export default defineTool({
  description:
    "Statically analyze provided code or a module description, surface untested paths, and return draft-ready test cases and assertion scaffolds.",
  inputSchema: planTestsInputSchema,
  async execute(input: unknown) {
    return planTests(normalizePlanTestsInput(input));
  }
});
