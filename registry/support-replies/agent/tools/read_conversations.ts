import { defineTool } from "eve/tools";
import { normalizeReadConversationsInput, readConversations, readConversationsInputSchema } from "../lib/intercom.js";

export default defineTool({
  description: "Read Intercom conversations and, by default, retrieve conversation parts for each returned conversation.",
  inputSchema: readConversationsInputSchema,
  async execute(input: unknown) {
    return readConversations(normalizeReadConversationsInput(input));
  },
});
