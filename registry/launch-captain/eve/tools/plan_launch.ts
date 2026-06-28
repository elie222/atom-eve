import { defineTool } from "eve/tools";
import { normalizePlanLaunchInput, planLaunch, planLaunchInputSchema } from "../lib/launch.js";

export default defineTool({
  description:
    "Plan a draft-first launch playbook (asset checklist, draft copy, and posting schedule) for a product on a given channel.",
  inputSchema: planLaunchInputSchema,
  async execute(input: unknown) {
    return planLaunch(normalizePlanLaunchInput(input));
  }
});
