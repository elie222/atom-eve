import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_SENTRY_BASE_URL = "https://sentry.io/api/0";
const DEFAULT_HISTORY_DIR = "reports/error-triage/history";

export const reviewSentryErrorsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    lookbackDays: {
      type: "integer",
      minimum: 1,
      maximum: 30,
      description: "Number of days of recent Sentry issues to review. Defaults to ERROR_TRIAGE_LOOKBACK_DAYS or 1."
    },
    environment: {
      type: "string",
      minLength: 1,
      description: "Sentry environment to filter by. Defaults to ERROR_TRIAGE_ENVIRONMENT or production."
    },
    maxIssues: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Maximum unresolved issues to inspect. Defaults to ERROR_TRIAGE_MAX_ISSUES or 25."
    },
    writeHistory: {
      type: "boolean",
      description: "Whether to write a local history report. Defaults to true."
    }
  }
} as const;

export interface ReviewSentryErrorsInput {
  lookbackDays?: number;
  environment?: string;
  maxIssues?: number;
  writeHistory?: boolean;
}

export interface TriageReport {
  generatedAt: string;
  source: "sentry";
  org: string;
  project: string;
  environment: string | null;
  lookbackDays: number;
  summary: {
    totalIssues: number;
    newGroups: number;
    recurringGroups: number;
    criticalGroups: number;
    highGroups: number;
  };
  groups: ErrorGroup[];
  historyPath: string | null;
  notes: string[];
}

export interface ErrorGroup {
  fingerprint: string;
  title: string;
  culprit: string | null;
  permalink: string | null;
  firstSeen: string | null;
  lastSeen: string | null;
  count: number;
  userCount: number;
  regression: "new" | "recurring" | "unknown";
  severity: "critical" | "high" | "medium" | "low";
  likelyOwner: string | null;
  likelyFile: string | null;
  evidence: string[];
  fixPlan: string[];
}

interface SentryConfig {
  token: string;
  org: string;
  project: string;
  baseUrl: string;
}

interface SentryIssue {
  id: string;
  shortId?: string;
  title?: string;
  culprit?: string;
  permalink?: string;
  firstSeen?: string;
  lastSeen?: string;
  count?: string | number;
  userCount?: number;
  level?: string;
  metadata?: {
    filename?: string;
    function?: string;
    type?: string;
    value?: string;
  };
  assignedTo?: {
    name?: string;
    email?: string;
    type?: string;
  } | null;
}

interface SentryEvent {
  entries?: Array<{
    type?: string;
    data?: {
      values?: Array<{
        stacktrace?: {
          frames?: SentryFrame[];
        };
      }>;
      frames?: SentryFrame[];
    };
  }>;
}

interface SentryFrame {
  filename?: string;
  absPath?: string;
  module?: string;
  function?: string;
  inApp?: boolean;
}

interface HistoryGroup {
  fingerprint: string;
  title: string;
  lastSeen: string | null;
}

interface HistoryReport {
  generatedAt: string;
  groups?: HistoryGroup[];
}

export async function reviewSentryErrors(input: ReviewSentryErrorsInput = {}, fetchImpl: typeof fetch = fetch): Promise<TriageReport> {
  const parsed = normalizeReviewSentryErrorsInput(input);
  const config = getSentryConfig();
  const lookbackDays = parsed.lookbackDays ?? Number(process.env.ERROR_TRIAGE_LOOKBACK_DAYS ?? 1);
  const environment = parsed.environment ?? process.env.ERROR_TRIAGE_ENVIRONMENT ?? "production";
  const maxIssues = parsed.maxIssues ?? Number(process.env.ERROR_TRIAGE_MAX_ISSUES ?? 25);
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000);
  const historyDir = process.env.ERROR_TRIAGE_HISTORY_DIR ?? DEFAULT_HISTORY_DIR;
  const previous = await readRecentHistory(historyDir);

  const issues = await fetchRecentIssues(config, { environment, since, maxIssues }, fetchImpl);
  const groups: ErrorGroup[] = [];

  for (const issue of issues) {
    const event = await fetchLatestEvent(config, issue.id, fetchImpl).catch(() => null);
    groups.push(buildGroup(issue, event, previous));
  }

  groups.sort((a, b) => severityRank(b.severity) - severityRank(a.severity) || b.count - a.count);

  const report: TriageReport = {
    generatedAt: new Date().toISOString(),
    source: "sentry",
    org: config.org,
    project: config.project,
    environment,
    lookbackDays,
    summary: {
      totalIssues: groups.length,
      newGroups: groups.filter((group) => group.regression === "new").length,
      recurringGroups: groups.filter((group) => group.regression === "recurring").length,
      criticalGroups: groups.filter((group) => group.severity === "critical").length,
      highGroups: groups.filter((group) => group.severity === "high").length
    },
    groups,
    historyPath: null,
    notes: [
      "Read-only run: no Sentry issue mutation, owner assignment, comments, or pull requests were created.",
      "History comparison uses local JSON reports. Persist reports/error-triage/history between runs to classify recurring errors."
    ]
  };

  if (parsed.writeHistory !== false) {
    report.historyPath = await writeHistoryReport(historyDir, report);
  }

  return report;
}

export function normalizeReviewSentryErrorsInput(input: unknown): ReviewSentryErrorsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Error triage input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    lookbackDays: optionalInteger(value.lookbackDays, "lookbackDays", 1, 30),
    environment: optionalString(value.environment, "environment"),
    maxIssues: optionalInteger(value.maxIssues, "maxIssues", 1, 100),
    writeHistory: optionalBoolean(value.writeHistory, "writeHistory")
  };
}

function getSentryConfig(): SentryConfig {
  const token = process.env.SENTRY_AUTH_TOKEN;
  const org = process.env.SENTRY_ORG;
  const project = process.env.SENTRY_PROJECT;
  if (!token || !org || !project) {
    throw new Error("SENTRY_AUTH_TOKEN, SENTRY_ORG, and SENTRY_PROJECT are required");
  }

  return {
    token,
    org,
    project,
    baseUrl: (process.env.SENTRY_BASE_URL ?? DEFAULT_SENTRY_BASE_URL).replace(/\/$/, "")
  };
}

async function fetchRecentIssues(
  config: SentryConfig,
  options: { environment: string; since: Date; maxIssues: number },
  fetchImpl: typeof fetch
): Promise<SentryIssue[]> {
  const url = new URL(`${config.baseUrl}/projects/${config.org}/${config.project}/issues/`);
  url.searchParams.set("query", `is:unresolved lastSeen:>=${options.since.toISOString()}`);
  url.searchParams.set("sort", "date");
  url.searchParams.set("limit", String(options.maxIssues));
  if (options.environment) url.searchParams.set("environment", options.environment);

  return sentryGet<SentryIssue[]>(url, config, fetchImpl);
}

async function fetchLatestEvent(config: SentryConfig, issueId: string, fetchImpl: typeof fetch): Promise<SentryEvent | null> {
  const url = new URL(`${config.baseUrl}/issues/${issueId}/events/latest/`);
  return sentryGet<SentryEvent>(url, config, fetchImpl);
}

async function sentryGet<T>(url: URL, config: SentryConfig, fetchImpl: typeof fetch): Promise<T> {
  const response = await fetchImpl(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error(`Sentry API failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

function buildGroup(issue: SentryIssue, event: SentryEvent | null, previous: Map<string, HistoryGroup>): ErrorGroup {
  const frames = extractFrames(event);
  const likelyFile = inferFile(issue, frames);
  const likelyOwner = inferOwner(issue, likelyFile);
  const count = Number(issue.count ?? 0);
  const userCount = Number(issue.userCount ?? 0);
  const fingerprint = issue.shortId || issue.id;
  const regression = previous.has(fingerprint) ? "recurring" : "new";
  const severity = inferSeverity(issue, count, userCount, regression);
  const title = issue.title ?? issue.metadata?.value ?? issue.metadata?.type ?? "Untitled Sentry issue";

  return {
    fingerprint,
    title,
    culprit: issue.culprit ?? null,
    permalink: issue.permalink ?? null,
    firstSeen: issue.firstSeen ?? null,
    lastSeen: issue.lastSeen ?? null,
    count,
    userCount,
    regression,
    severity,
    likelyOwner,
    likelyFile,
    evidence: buildEvidence(issue, likelyFile, regression, count, userCount),
    fixPlan: buildFixPlan(title, likelyFile)
  };
}

function extractFrames(event: SentryEvent | null): SentryFrame[] {
  const entries = event?.entries ?? [];
  const frames: SentryFrame[] = [];
  for (const entry of entries) {
    const values = entry.data?.values ?? [];
    for (const value of values) {
      frames.push(...(value.stacktrace?.frames ?? []));
    }
    frames.push(...(entry.data?.frames ?? []));
  }
  return frames;
}

function inferFile(issue: SentryIssue, frames: SentryFrame[]): string | null {
  const inAppFrame = [...frames].reverse().find((frame) => frame.inApp && (frame.filename || frame.absPath));
  const frame = inAppFrame ?? [...frames].reverse().find((item) => item.filename || item.absPath);
  return normalizeFile(issue.metadata?.filename ?? frame?.filename ?? frame?.absPath ?? null);
}

function inferOwner(issue: SentryIssue, likelyFile: string | null): string | null {
  if (issue.assignedTo?.name) return issue.assignedTo.name;
  if (issue.assignedTo?.email) return issue.assignedTo.email;
  if (!likelyFile) return null;
  const segments = likelyFile.split("/");
  const appsIndex = segments.indexOf("apps");
  if (appsIndex >= 0 && segments[appsIndex + 1]) return `app:${segments[appsIndex + 1]}`;
  const packagesIndex = segments.indexOf("packages");
  if (packagesIndex >= 0 && segments[packagesIndex + 1]) return `package:${segments[packagesIndex + 1]}`;
  return null;
}

function inferSeverity(issue: SentryIssue, count: number, userCount: number, regression: ErrorGroup["regression"]): ErrorGroup["severity"] {
  const level = issue.level?.toLowerCase();
  if (level === "fatal" || userCount >= 50 || count >= 500) return "critical";
  if (level === "error" && (regression === "new" || userCount >= 10 || count >= 100)) return "high";
  if (level === "warning" || userCount >= 3 || count >= 25) return "medium";
  return "low";
}

function buildEvidence(
  issue: SentryIssue,
  likelyFile: string | null,
  regression: ErrorGroup["regression"],
  count: number,
  userCount: number
): string[] {
  const evidence = [
    `${regression === "new" ? "New" : "Recurring"} signature in local history comparison.`,
    `${count} event(s) across ${userCount} affected user(s).`
  ];
  if (issue.lastSeen) evidence.push(`Last seen at ${issue.lastSeen}.`);
  if (likelyFile) evidence.push(`Likely file from Sentry metadata or stack frame: ${likelyFile}.`);
  if (issue.culprit) evidence.push(`Sentry culprit: ${issue.culprit}.`);
  return evidence;
}

function buildFixPlan(title: string, likelyFile: string | null): string[] {
  const target = likelyFile ?? "the narrowest module named by the stack trace";
  return [
    `Write a failing regression test that reproduces "${title}" in ${target}.`,
    "Run the focused test to confirm it fails for the observed error path.",
    "Implement the smallest fix that makes the regression test pass without broad control-flow changes.",
    "Add or update boundary coverage for malformed, missing, or unexpected production inputs.",
    "Run the focused test, then the relevant package typecheck or build before shipping."
  ];
}

function normalizeFile(value: string | null): string | null {
  if (!value) return null;
  const withoutQuery = value.split("?")[0] ?? value;
  const marker = withoutQuery.match(/(?:apps|packages|src|app|pages|components)\/.+$/);
  return marker?.[0] ?? withoutQuery;
}

function severityRank(severity: ErrorGroup["severity"]): number {
  return { low: 1, medium: 2, high: 3, critical: 4 }[severity];
}

function optionalInteger(value: unknown, field: string, min: number, max: number): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new Error(`${field} must be an integer between ${min} and ${max}.`);
  }
  return value as number;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value;
}

function optionalBoolean(value: unknown, field: string): boolean | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "boolean") {
    throw new Error(`${field} must be a boolean.`);
  }
  return value;
}

async function readRecentHistory(historyDir: string): Promise<Map<string, HistoryGroup>> {
  const entries = await readdir(historyDir).catch(() => []);
  const reports = await Promise.all(
    entries
      .filter((entry) => entry.endsWith(".json"))
      .slice(-10)
      .map(async (entry) => {
        const raw = await readFile(path.join(historyDir, entry), "utf8");
        return JSON.parse(raw) as HistoryReport;
      })
  );

  const groups = new Map<string, HistoryGroup>();
  for (const report of reports) {
    for (const group of report.groups ?? []) {
      groups.set(group.fingerprint, group);
    }
  }
  return groups;
}

async function writeHistoryReport(historyDir: string, report: TriageReport): Promise<string> {
  await mkdir(historyDir, { recursive: true });
  const stamp = report.generatedAt.replace(/[:.]/g, "-");
  const filePath = path.join(historyDir, `${stamp}.json`);
  await writeFile(filePath, `${JSON.stringify(report, null, 2)}\n`);
  return filePath;
}
