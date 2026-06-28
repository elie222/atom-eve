import { defineTool } from "eve/tools";
import { createVercelSeoAuditMemoryStore } from "../lib/vercel-blob-memory.js";
import type { SeoAuditMemoryIndex, SeoAuditRunSummary } from "../lib/seo-memory.js";

interface ReadSeoHistoryInput {
  siteUrl: string;
  recentLimit?: number;
}

async function readJsonOrNull<T>(store: ReturnType<typeof createVercelSeoAuditMemoryStore>, path: string): Promise<T | null> {
  try {
    return await store.readJson<T>(path);
  } catch {
    return null;
  }
}

async function readTextOrNull(store: ReturnType<typeof createVercelSeoAuditMemoryStore>, path: string): Promise<string | null> {
  try {
    return await store.readText(path);
  } catch {
    return null;
  }
}

export default defineTool({
  description: "Read prior SEO audit memory for the configured site. Use this before starting a recurring audit.",
  inputSchema: {
    type: "object",
    properties: {
      siteUrl: { type: "string", minLength: 1 },
      recentLimit: { type: "number", minimum: 1, maximum: 20 }
    },
    required: ["siteUrl"],
    additionalProperties: false
  },
  async execute(input: ReadSeoHistoryInput) {
    const store = createVercelSeoAuditMemoryStore(input.siteUrl);
    const recentLimit = input.recentLimit ?? 5;
    const index = await readJsonOrNull<SeoAuditMemoryIndex>(store, "index.json");
    const latest = await readJsonOrNull<SeoAuditRunSummary>(store, "latest.json");
    const latestReport = await readTextOrNull(store, "latest.md");
    const recentRuns = index?.runs.slice(-recentLimit) ?? (latest ? [latest] : []);

    return {
      siteUrl: input.siteUrl,
      found: Boolean(index || latest || latestReport),
      latest,
      latestReport,
      recentRuns,
      openIssues: index?.openIssues ?? {}
    };
  }
});
