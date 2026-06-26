import { normalizePlanLaunchInput, planLaunch as planLaunchPlaybook } from "../../lib/agents/launch-captain/launch.js";

export async function planLaunch(input: unknown) {
  return planLaunchPlaybook(normalizePlanLaunchInput(input));
}
