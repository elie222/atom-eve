import { defineTool } from "eve/tools";
import { createVercelSeoAuditMemoryStore } from "../lib/vercel-blob-memory.js";

interface ListSeoMemoryInput {
  siteUrl: string;
  prefix?: string;
  limit?: number;
  cursor?: string;
}

export default defineTool({
  description:
    "List SEO audit memory files from Vercel Blob for the configured site. Use this as the default Eve memory backend.",
  inputSchema: {
    type: "object",
    properties: {
      siteUrl: { type: "string", minLength: 1 },
      prefix: { type: "string" },
      limit: { type: "number", minimum: 1, maximum: 1000 },
      cursor: { type: "string" }
    },
    required: ["siteUrl"],
    additionalProperties: false
  },
  async execute(input: ListSeoMemoryInput) {
    const store = createVercelSeoAuditMemoryStore(input.siteUrl);
    return store.list(input.prefix ?? "", { limit: input.limit ?? 100, cursor: input.cursor });
  }
});
