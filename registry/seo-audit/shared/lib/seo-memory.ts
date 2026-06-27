import {
  createAgentMemoryStore,
  joinMemoryPath,
  normalizePrefix,
  normalizeMemorySegment,
  type AgentBlobClient,
  type AgentMemoryProvider,
  type AgentMemoryStore
} from "./memory.js";

export const seoAuditMemoryRoot = "seo-audit";

export interface SeoAuditIssueMemory {
  id: string;
  title: string;
  severity: "critical" | "high" | "medium" | "low";
  status: "new" | "recurring" | "resolved" | "improved" | "worse";
  url?: string;
  firstSeen?: string;
  lastSeen?: string;
}

export interface SeoAuditRunSummary {
  runId: string;
  createdAt: string;
  siteUrl: string;
  auditedUrls: string[];
  issueCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  resolvedIssueIds: string[];
  reportPath: string;
  summaryPath: string;
}

export interface SeoAuditMemoryIndex {
  provider: AgentMemoryProvider;
  siteUrl: string;
  latestRunId?: string;
  runs: SeoAuditRunSummary[];
  openIssues: Record<string, SeoAuditIssueMemory>;
  updatedAt: string;
}

export interface SeoAuditMemoryPaths {
  sitePrefix: string;
  latestJson: string;
  latestMarkdown: string;
  indexJson: string;
  runSummaryJson: string;
  runReportMarkdown: string;
  runPagesJson: string;
  runIssuesJson: string;
}

export function createSeoAuditMemoryStore(options: {
  client: AgentBlobClient;
  siteUrl: string;
  basePrefix?: string;
}): AgentMemoryStore {
  return createAgentMemoryStore({
    client: options.client,
    basePrefix: seoAuditSitePrefix(options.siteUrl, options.basePrefix)
  });
}

export function seoAuditSitePrefix(siteUrl: string, basePrefix = seoAuditMemoryRoot): string {
  return joinMemoryPath(normalizePrefix(basePrefix), normalizeMemorySegment(siteUrl, "configured-site"));
}

export function seoAuditRunId(date = new Date()): string {
  return date.toISOString().replace(/[:.]/g, "-");
}

export function seoAuditMemoryPaths(siteUrl: string, runId: string, basePrefix = seoAuditMemoryRoot): SeoAuditMemoryPaths {
  const sitePrefix = seoAuditSitePrefix(siteUrl, basePrefix);
  const runPrefix = joinMemoryPath(sitePrefix, "runs", runId);

  return {
    sitePrefix,
    latestJson: joinMemoryPath(sitePrefix, "latest.json"),
    latestMarkdown: joinMemoryPath(sitePrefix, "latest.md"),
    indexJson: joinMemoryPath(sitePrefix, "index.json"),
    runSummaryJson: joinMemoryPath(runPrefix, "summary.json"),
    runReportMarkdown: joinMemoryPath(runPrefix, "report.md"),
    runPagesJson: joinMemoryPath(runPrefix, "pages.json"),
    runIssuesJson: joinMemoryPath(runPrefix, "issues.json")
  };
}

export function emptySeoAuditMemoryIndex(options: {
  provider: AgentMemoryProvider;
  siteUrl: string;
  now?: string;
}): SeoAuditMemoryIndex {
  return {
    provider: options.provider,
    siteUrl: options.siteUrl,
    runs: [],
    openIssues: {},
    updatedAt: options.now ?? new Date().toISOString()
  };
}
