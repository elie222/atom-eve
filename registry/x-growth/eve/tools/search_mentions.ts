import { defineTool } from "eve/tools";
import {
  normalizeSearchXMentionsInput,
  searchXMentions,
  searchXMentionsInputSchema
} from "../lib/x.js";

export default defineTool({
  description: "Search recent X mentions for the configured brand or keywords and return a draft-ready review.",
  inputSchema: searchXMentionsInputSchema,
  async execute(input: unknown) {
    return searchXMentions(normalizeSearchXMentionsInput(input));
  }
});
