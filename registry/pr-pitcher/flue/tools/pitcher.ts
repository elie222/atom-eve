import { draftPitch as draftPitchPlan, normalizeDraftPitchInput } from "../../lib/agents/pr-pitcher/pitcher.js";

export async function draftPitch(input: unknown) {
  return draftPitchPlan(normalizeDraftPitchInput(input));
}
