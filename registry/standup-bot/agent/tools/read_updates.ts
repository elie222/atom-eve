import { defineTool } from "eve/tools";
import { normalizeReadUpdatesInput, readUpdates, readUpdatesInputSchema } from "../lib/slack.js";

export default defineTool({
  description: "Read recent Slack channel messages from the configured standup channel.",
  inputSchema: readUpdatesInputSchema,
  async execute(input: unknown) {
    return readUpdates(normalizeReadUpdatesInput(input));
  }
});
