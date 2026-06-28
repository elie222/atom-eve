import { planClips as planClipsImpl, type PlanClipsInput } from "../../lib/agents/short-video/fal.js";

export async function planClips(input: PlanClipsInput = {}) {
  return planClipsImpl(input);
}
