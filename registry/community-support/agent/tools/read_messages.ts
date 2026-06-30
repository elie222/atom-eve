import { defineTool } from "eve/tools";
import { normalizeReadMessagesInput, readMessages, readMessagesInputSchema } from "../lib/discord.js";

export default defineTool({
  description: "Read recent messages from the configured Discord channel.",
  inputSchema: readMessagesInputSchema,
  async execute(input: unknown) {
    return readMessages(normalizeReadMessagesInput(input));
  },
});
