import { draftCopy as buildCopyDraft, normalizeDraftCopyInput } from "../../lib/agents/buyer-voice/voice.js";

export async function draftCopy(input?: unknown) {
  return buildCopyDraft(normalizeDraftCopyInput(input));
}
