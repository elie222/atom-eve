import { reviewExperiments as reviewPostHogExperiments } from "../../lib/agents/experiment-analyst/posthog.js";

export async function reviewExperiments() {
  return reviewPostHogExperiments();
}
