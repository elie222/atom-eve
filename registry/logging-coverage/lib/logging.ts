export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogStatementDraft {
  level: LogLevel;
  event: string;
  where: string;
  fields: string[];
  reason: string;
  draft: string;
}

export interface LoggingCoveragePlan {
  generatedAt: string;
  mode: "read_only_draft";
  focus: string;
  analyzedInput: boolean;
  detectedGaps: LogStatementDraft[];
  coverageChecklist: string[];
  draftingHint: string;
}

export const planLoggingInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    code: {
      type: "string",
      description:
        "Code snippet or critical-path description to scan for logging gaps. Omit to get the baseline coverage checklist only."
    },
    focus: {
      type: "string",
      description: "Name of the path or service under review, used to namespace drafted log events. Defaults to 'critical path'."
    }
  }
} as const;

export interface PlanLoggingInput {
  code?: string;
  focus?: string;
}

export function normalizePlanLoggingInput(input: unknown): PlanLoggingInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Logging plan input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.code !== undefined && typeof value.code !== "string") {
    throw new Error("code must be a string.");
  }
  if (value.focus !== undefined && typeof value.focus !== "string") {
    throw new Error("focus must be a string.");
  }

  return {
    code: value.code as string | undefined,
    focus: value.focus as string | undefined
  };
}

interface Signal {
  test: RegExp;
  level: LogLevel;
  event: string;
  fields: string[];
  reason: string;
}

// Heuristics for the kinds of important paths that most often lack a log statement.
const SIGNALS: Signal[] = [
  {
    test: /catch\s*\(/,
    level: "error",
    event: "error.caught",
    fields: ["err.message", "err.stack", "requestId"],
    reason: "Caught exception path with no log statement to capture the failure."
  },
  {
    test: /\bthrow\b/,
    level: "warn",
    event: "operation.rejected",
    fields: ["reason", "requestId"],
    reason: "Error is thrown without a preceding log explaining why."
  },
  {
    test: /\b(fetch|axios|http|grpc|request)\b/i,
    level: "info",
    event: "dependency.call",
    fields: ["target", "durationMs", "status"],
    reason: "External dependency call at an integration boundary that should be traced."
  },
  {
    test: /\b(stripe|charge|payment|invoice|refund|checkout|subscription)\b/i,
    level: "info",
    event: "payment.transition",
    fields: ["userId", "amount", "currency", "paymentId"],
    reason: "High-value money path that should be auditable end to end."
  },
  {
    test: /\b(login|signup|sign_up|signin|sign_in|auth|password|token|session)\b/i,
    level: "info",
    event: "auth.event",
    fields: ["userId", "method", "outcome"],
    reason: "Authentication or session boundary that should record success and failure."
  },
  {
    test: /\b(async\s+function|function\s+\w+|=>\s*\{)/,
    level: "debug",
    event: "handler.span",
    fields: ["args", "requestId"],
    reason: "Entry point with no start/finish breadcrumb to bound its execution."
  }
];

function slugify(focus: string): string {
  const slug = focus
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
  return slug.length > 0 ? slug : "critical.path";
}

function draftStatement(namespace: string, signal: Signal): string {
  const fields = signal.fields.join(", ");
  return `logger.${signal.level}("${namespace}.${signal.event}", { ${fields} });`;
}

function analyzeCode(namespace: string, code: string): LogStatementDraft[] {
  const lines = code.split(/\r?\n/);
  const drafts: LogStatementDraft[] = [];

  for (const signal of SIGNALS) {
    const lineIndex = lines.findIndex((line) => signal.test.test(line));
    if (lineIndex === -1) continue;
    drafts.push({
      level: signal.level,
      event: `${namespace}.${signal.event}`,
      where: `line ${lineIndex + 1}: ${lines[lineIndex].trim().slice(0, 80)}`,
      fields: signal.fields,
      reason: signal.reason,
      draft: draftStatement(namespace, signal)
    });
  }

  return drafts;
}

// Pure, network-free planner. It scans the provided code or critical-path description for paths that
// commonly lack observability and drafts structured log statements to add. It never reads files or
// edits anything; the operator applies the drafts after review.
export function planLogging(input: PlanLoggingInput = {}): LoggingCoveragePlan {
  const focus = input.focus ?? "critical path";
  const namespace = slugify(focus);
  const code = input.code?.trim();
  const analyzedInput = Boolean(code);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    focus,
    analyzedInput,
    detectedGaps: analyzedInput ? analyzeCode(namespace, code as string) : [],
    coverageChecklist: [
      "Service/request entry and exit, with a correlation or request id.",
      "Every catch block and rejected promise, logged at error with the error and stack.",
      "External dependency calls (HTTP, DB, queue) with target, status, and duration.",
      "Auth and authorization decisions, recording outcome without secrets.",
      "Money and state-changing transitions (payments, writes, deletes).",
      "Retries, fallbacks, and circuit-breaker trips at warn.",
      "Feature-flag and config branches that change behavior."
    ],
    draftingHint:
      "Review each drafted log statement, rename events and fields to match this project's logger and schema, and add them at the indicated locations. Never log secrets, tokens, or full PII. This tool only reads and drafts; it does not modify any files."
  };
}
