import { defineTool } from "eve/tools";
import { normalizeReviewUpdatesInput, reviewUpdates, reviewUpdatesInputSchema } from "../lib/slack.js";

export default defineTool({
  description: "Read recent Slack channel updates and return a draft-ready summary for a standup digest.",
  inputSchema: reviewUpdatesInputSchema,
  async execute(input: unknown) {
    return reviewUpdates(normalizeReviewUpdatesInput(input));
  }
});
