import { defineTool } from "eve/tools";
import { findThreads, findThreadsInputSchema, normalizeFindThreadsInput } from "../lib/reddit.js";

export default defineTool({
  description: "Search target subreddits and keywords, then rank matching Reddit threads by fit and reach for drafting replies.",
  inputSchema: findThreadsInputSchema,
  async execute(input: unknown) {
    return findThreads(normalizeFindThreadsInput(input));
  }
});
