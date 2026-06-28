import { normalizeSearchXMentionsInput, searchXMentions } from "../../lib/agents/x-growth/x.js";

export async function searchMentions(input: unknown) {
  return searchXMentions(normalizeSearchXMentionsInput(input));
}
