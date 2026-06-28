export interface EndpointTarget {
  url: string;
  expectedStatus?: number;
  expectedContent?: string;
}

export interface EndpointHealth {
  url: string;
  ok: boolean;
  status: number | null;
  statusOk: boolean;
  latencyMs: number | null;
  expectedStatus: number | null;
  expectedContent: string | null;
  contentOk: boolean | null;
  error: string | null;
  severity: "ok" | "warn" | "down";
  note: string;
}

export interface UptimeReport {
  generatedAt: string;
  mode: "read_only_monitor";
  checked: number;
  healthy: number;
  degraded: number;
  down: number;
  results: EndpointHealth[];
  followUpHint: string;
}

export interface CheckEndpointsInput {
  targets: EndpointTarget[];
  timeoutMs?: number;
}

// Latency above this threshold marks an otherwise-healthy endpoint as degraded.
const SLOW_LATENCY_MS = 2000;
const DEFAULT_TIMEOUT_MS = 10_000;

export const checkEndpointsInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["urls"],
  properties: {
    urls: {
      type: "array",
      minItems: 1,
      description:
        "Target endpoints to check. Each item is an absolute http(s) URL string, or an object with url and optional expectedStatus and expectedContent.",
      items: {
        oneOf: [
          { type: "string" },
          {
            type: "object",
            additionalProperties: false,
            required: ["url"],
            properties: {
              url: { type: "string", description: "Absolute http(s) URL to check." },
              expectedStatus: {
                type: "integer",
                description: "HTTP status the endpoint should return. Defaults to any status below 400."
              },
              expectedContent: {
                type: "string",
                description: "Substring the response body must contain to count as healthy."
              }
            }
          }
        ]
      }
    },
    timeoutMs: {
      type: "integer",
      description: "Per-request timeout in milliseconds. Defaults to 10000."
    }
  }
} as const;

export function normalizeCheckEndpointsInput(input: unknown): CheckEndpointsInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Uptime check input must be an object with a urls array.");
  }

  const value = input as Record<string, unknown>;
  if (!Array.isArray(value.urls) || value.urls.length === 0) {
    throw new Error("urls must be a non-empty array of URL strings or { url } objects.");
  }

  const targets = value.urls.map((entry, index) => normalizeTarget(entry, index));

  let timeoutMs: number | undefined;
  if (value.timeoutMs !== undefined) {
    if (typeof value.timeoutMs !== "number" || !Number.isFinite(value.timeoutMs) || value.timeoutMs <= 0) {
      throw new Error("timeoutMs must be a positive number of milliseconds.");
    }
    timeoutMs = value.timeoutMs;
  }

  return { targets, timeoutMs };
}

export async function checkEndpoints(
  input: CheckEndpointsInput,
  fetchImpl: typeof fetch = fetch
): Promise<UptimeReport> {
  const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
  const results = await Promise.all(input.targets.map((target) => checkOne(target, timeoutMs, fetchImpl)));

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_monitor",
    checked: results.length,
    healthy: results.filter((r) => r.severity === "ok").length,
    degraded: results.filter((r) => r.severity === "warn").length,
    down: results.filter((r) => r.severity === "down").length,
    results,
    followUpHint:
      "This is a read-only health snapshot. Investigate any down or degraded endpoints; no remediation was performed."
  };
}

async function checkOne(
  target: EndpointTarget,
  timeoutMs: number,
  fetchImpl: typeof fetch
): Promise<EndpointHealth> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const startedAt = Date.now();

  try {
    const response = await fetchImpl(target.url, { signal: controller.signal, redirect: "follow" });
    const latencyMs = Date.now() - startedAt;
    const statusOk = target.expectedStatus != null ? response.status === target.expectedStatus : response.status < 400;

    let contentOk: boolean | null = null;
    if (target.expectedContent != null) {
      const body = await response.text().catch(() => "");
      contentOk = body.includes(target.expectedContent);
    }

    const severity: EndpointHealth["severity"] = !statusOk
      ? "down"
      : contentOk === false || latencyMs > SLOW_LATENCY_MS
        ? "warn"
        : "ok";

    return {
      url: target.url,
      ok: severity === "ok",
      status: response.status,
      statusOk,
      latencyMs,
      expectedStatus: target.expectedStatus ?? null,
      expectedContent: target.expectedContent ?? null,
      contentOk,
      error: null,
      severity,
      note: describe(severity, statusOk, contentOk, latencyMs)
    };
  } catch (error) {
    return {
      url: target.url,
      ok: false,
      status: null,
      statusOk: false,
      latencyMs: null,
      expectedStatus: target.expectedStatus ?? null,
      expectedContent: target.expectedContent ?? null,
      contentOk: target.expectedContent != null ? false : null,
      error: error instanceof Error ? error.message : String(error),
      severity: "down",
      note: "Request failed or timed out before a response was received."
    };
  } finally {
    clearTimeout(timer);
  }
}

function describe(
  severity: EndpointHealth["severity"],
  statusOk: boolean,
  contentOk: boolean | null,
  latencyMs: number
): string {
  if (!statusOk) return "Unexpected HTTP status; treat this endpoint as down.";
  if (contentOk === false) return "Expected content was missing from the response body.";
  if (latencyMs > SLOW_LATENCY_MS) return `Responded slowly (${latencyMs}ms); investigate latency.`;
  return `Healthy; responded in ${latencyMs}ms.`;
}

function normalizeTarget(entry: unknown, index: number): EndpointTarget {
  if (typeof entry === "string") {
    return { url: requireUrl(entry, index) };
  }

  if (typeof entry === "object" && entry !== null && !Array.isArray(entry)) {
    const value = entry as Record<string, unknown>;
    if (typeof value.url !== "string") {
      throw new Error(`urls[${index}].url must be a string.`);
    }

    const target: EndpointTarget = { url: requireUrl(value.url, index) };

    if (value.expectedStatus !== undefined) {
      if (typeof value.expectedStatus !== "number" || !Number.isInteger(value.expectedStatus)) {
        throw new Error(`urls[${index}].expectedStatus must be an integer.`);
      }
      target.expectedStatus = value.expectedStatus;
    }

    if (value.expectedContent !== undefined) {
      if (typeof value.expectedContent !== "string") {
        throw new Error(`urls[${index}].expectedContent must be a string.`);
      }
      target.expectedContent = value.expectedContent;
    }

    return target;
  }

  throw new Error(`urls[${index}] must be a URL string or an object with a url property.`);
}

function requireUrl(raw: string, index: number): string {
  const url = raw.trim();
  if (!/^https?:\/\//i.test(url)) {
    throw new Error(`urls[${index}] must be an absolute http(s) URL.`);
  }
  return url;
}
