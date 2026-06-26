import { defineTool } from "eve/tools";
import { createVercelSeoAuditMemoryStore } from "../lib/vercel-blob-memory.js";

interface WriteSeoMemoryInput {
  siteUrl: string;
  path: string;
  content: string;
  contentType?: string;
}

export default defineTool({
  description:
    "Write one SEO audit memory file to Vercel Blob for the configured site. Use this as the default Eve memory backend for compact JSON snapshots and Markdown reports.",
  inputSchema: {
    type: "object",
    properties: {
      siteUrl: { type: "string", minLength: 1 },
      path: { type: "string", minLength: 1 },
      content: { type: "string", minLength: 1 },
      contentType: { type: "string" }
    },
    required: ["siteUrl", "path", "content"],
    additionalProperties: false
  },
  async execute(input: WriteSeoMemoryInput) {
    const store = createVercelSeoAuditMemoryStore(input.siteUrl);
    await store.writeText(input.path, input.content, { contentType: input.contentType });
    return {
      path: store.key(input.path),
      written: true
    };
  }
});
