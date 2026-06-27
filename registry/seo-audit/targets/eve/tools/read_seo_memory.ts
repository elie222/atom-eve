import { defineTool } from "eve/tools";
import { createVercelSeoAuditMemoryStore } from "../lib/vercel-blob-memory.js";

interface ReadSeoMemoryInput {
  siteUrl: string;
  path: string;
}

export default defineTool({
  description:
    "Read one SEO audit memory file from Vercel Blob for the configured site. Use this as the default Eve memory backend with paths such as latest.json or runs/<run-id>/summary.json.",
  inputSchema: {
    type: "object",
    properties: {
      siteUrl: { type: "string", minLength: 1 },
      path: { type: "string", minLength: 1 }
    },
    required: ["siteUrl", "path"],
    additionalProperties: false
  },
  async execute(input: ReadSeoMemoryInput) {
    const store = createVercelSeoAuditMemoryStore(input.siteUrl);
    const content = await store.readText(input.path);
    return {
      path: input.path,
      found: content !== null,
      content
    };
  }
});
