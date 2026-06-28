import { defineTool } from "eve/tools";
import {
  emptySeoAuditMemoryIndex,
  seoAuditRunId,
  type SeoAuditIssueMemory,
  type SeoAuditMemoryIndex,
  type SeoAuditRunSummary
} from "../lib/seo-memory.js";
import { createVercelSeoAuditMemoryStore } from "../lib/vercel-blob-memory.js";

type Severity = "critical" | "high" | "medium" | "low";

interface SeoAuditIssueInput {
  id?: string;
  title?: string;
  severity?: Severity;
  status?: SeoAuditIssueMemory["status"];
  url?: string;
  [key: string]: unknown;
}

interface SaveSeoAuditRunInput {
  siteUrl: string;
  reportMarkdown: string;
  auditedUrls?: string[];
  issueCounts?: Partial<Record<Severity, number>>;
  resolvedIssueIds?: string[];
  pages?: Array<Record<string, unknown>>;
  issues?: SeoAuditIssueInput[];
  summary?: Record<string, unknown>;
  openIssues?: Record<string, SeoAuditIssueMemory>;
}

const severities: Severity[] = ["critical", "high", "medium", "low"];

function normalizeIssueCounts(input: SaveSeoAuditRunInput): SeoAuditRunSummary["issueCounts"] {
  const counts = { critical: 0, high: 0, medium: 0, low: 0 };

  for (const severity of severities) {
    const value = input.issueCounts?.[severity];
    if (typeof value === "number" && Number.isFinite(value)) counts[severity] = Math.max(0, Math.floor(value));
  }

  if (input.issueCounts) return counts;

  for (const issue of input.issues ?? []) {
    if (issue.severity && issue.severity in counts) counts[issue.severity] += 1;
  }

  return counts;
}

function mergeOpenIssues(
  existing: Record<string, SeoAuditIssueMemory>,
  issues: SeoAuditIssueInput[] | undefined,
  resolvedIssueIds: string[] | undefined,
  createdAt: string
): Record<string, SeoAuditIssueMemory> {
  const openIssues = { ...existing };

  for (const issueId of resolvedIssueIds ?? []) {
    delete openIssues[issueId];
  }

  for (const issue of issues ?? []) {
    if (!issue.id || !issue.title || !issue.severity) continue;
    if (issue.status === "resolved") {
      delete openIssues[issue.id];
      continue;
    }

    openIssues[issue.id] = {
      id: issue.id,
      title: issue.title,
      severity: issue.severity,
      status: issue.status ?? openIssues[issue.id]?.status ?? "new",
      url: issue.url ?? openIssues[issue.id]?.url,
      firstSeen: openIssues[issue.id]?.firstSeen ?? createdAt,
      lastSeen: createdAt
    };
  }

  return openIssues;
}

async function readIndex(
  store: ReturnType<typeof createVercelSeoAuditMemoryStore>,
  siteUrl: string,
  createdAt: string
): Promise<SeoAuditMemoryIndex> {
  try {
    return (
      (await store.readJson<SeoAuditMemoryIndex>("index.json")) ??
      emptySeoAuditMemoryIndex({ provider: "vercel-blob", siteUrl, now: createdAt })
    );
  } catch {
    return emptySeoAuditMemoryIndex({ provider: "vercel-blob", siteUrl, now: createdAt });
  }
}

export default defineTool({
  description: "Save the current SEO audit report and compact memory for future comparisons. Use this after finishing a recurring audit.",
  inputSchema: {
    type: "object",
    properties: {
      siteUrl: { type: "string", minLength: 1 },
      reportMarkdown: { type: "string", minLength: 1 },
      auditedUrls: { type: "array", items: { type: "string" } },
      issueCounts: {
        type: "object",
        properties: {
          critical: { type: "number", minimum: 0 },
          high: { type: "number", minimum: 0 },
          medium: { type: "number", minimum: 0 },
          low: { type: "number", minimum: 0 }
        },
        additionalProperties: false
      },
      resolvedIssueIds: { type: "array", items: { type: "string" } },
      pages: { type: "array", items: { type: "object", additionalProperties: true } },
      issues: { type: "array", items: { type: "object", additionalProperties: true } },
      summary: { type: "object", additionalProperties: true },
      openIssues: { type: "object", additionalProperties: { type: "object", additionalProperties: true } }
    },
    required: ["siteUrl", "reportMarkdown"],
    additionalProperties: false
  },
  async execute(input: SaveSeoAuditRunInput) {
    const store = createVercelSeoAuditMemoryStore(input.siteUrl);
    const createdAt = new Date().toISOString();
    const runId = seoAuditRunId(new Date(createdAt));
    const reportPath = `runs/${runId}/report.md`;
    const summaryPath = `runs/${runId}/summary.json`;
    const pagesPath = `runs/${runId}/pages.json`;
    const issuesPath = `runs/${runId}/issues.json`;
    const issueCounts = normalizeIssueCounts(input);
    const priorIndex = await readIndex(store, input.siteUrl, createdAt);

    const runSummary: SeoAuditRunSummary & Record<string, unknown> = {
      ...input.summary,
      runId,
      createdAt,
      siteUrl: input.siteUrl,
      auditedUrls: input.auditedUrls ?? [],
      issueCounts,
      resolvedIssueIds: input.resolvedIssueIds ?? [],
      reportPath,
      summaryPath
    };

    const index: SeoAuditMemoryIndex = {
      ...priorIndex,
      provider: "vercel-blob",
      siteUrl: input.siteUrl,
      latestRunId: runId,
      runs: [...priorIndex.runs.filter((run) => run.runId !== runId), runSummary],
      openIssues: input.openIssues ?? mergeOpenIssues(priorIndex.openIssues, input.issues, input.resolvedIssueIds, createdAt),
      updatedAt: createdAt
    };

    await store.writeText(reportPath, input.reportMarkdown, { contentType: "text/markdown" });
    await store.writeJson(summaryPath, runSummary);
    await store.writeJson(pagesPath, input.pages ?? []);
    await store.writeJson(issuesPath, input.issues ?? []);
    await store.writeText("latest.md", input.reportMarkdown, { contentType: "text/markdown" });
    await store.writeJson("latest.json", runSummary);
    await store.writeJson("index.json", index);

    return {
      saved: true,
      runId,
      artifacts: {
        report: store.key(reportPath),
        summary: store.key(summaryPath),
        pages: store.key(pagesPath),
        issues: store.key(issuesPath),
        latestReport: store.key("latest.md"),
        latestSummary: store.key("latest.json"),
        index: store.key("index.json")
      }
    };
  }
});
