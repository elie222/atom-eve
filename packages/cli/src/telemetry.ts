// Anonymous usage telemetry. No identifier of any kind is sent: each event is a
// standalone count (which agent was installed, target, host), never tied to a
// machine or user. Mirrors the skills.sh model. Opt out with
// ATOM_EVE_DISABLE_TELEMETRY=1 or the standard DO_NOT_TRACK=1.
import { readFileSync } from "node:fs";

const TELEMETRY_URL = process.env.ATOM_EVE_TELEMETRY_URL ?? "https://www.atomeve.dev/api/t";

interface InstallEvent {
  event: "install";
  agent: string;
  target: string;
  channel?: string;
}

const pending: Promise<void>[] = [];

function enabled(): boolean {
  return !process.env.ATOM_EVE_DISABLE_TELEMETRY && !process.env.DO_NOT_TRACK;
}

function isCI(): boolean {
  return Boolean(
    process.env.CI ||
      process.env.GITHUB_ACTIONS ||
      process.env.GITLAB_CI ||
      process.env.CIRCLECI ||
      process.env.TRAVIS ||
      process.env.BUILDKITE ||
      process.env.JENKINS_URL
  );
}

// Best-effort detection of the coding agent the CLI runs inside, for the same
// "which tools install agents" signal skills.sh collects. Never anything user-identifying.
function detectHost(): string | null {
  if (process.env.CLAUDECODE || process.env.CLAUDE_CODE_ENTRYPOINT) return "claude-code";
  if (process.env.CURSOR_TRACE_ID) return "cursor";
  if (process.env.CODESPACES) return "codespaces";
  if (process.env.TERM_PROGRAM === "vscode") return "vscode";
  return null;
}

function cliVersion(): string | null {
  try {
    const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8"));
    return typeof pkg.version === "string" ? pkg.version : null;
  } catch {
    return null;
  }
}

export function track(event: InstallEvent): void {
  if (!enabled()) return;
  try {
    const params = new URLSearchParams();
    const version = cliVersion();
    if (version) params.set("v", version);
    if (isCI()) params.set("ci", "1");
    const host = detectHost();
    if (host) params.set("host", host);
    for (const [key, value] of Object.entries(event)) {
      if (value != null) params.set(key, String(value));
    }
    // Fire and forget; flushTelemetry awaits in-flight requests before exit.
    const request = fetch(`${TELEMETRY_URL}?${params.toString()}`)
      .then(() => {})
      .catch(() => {});
    pending.push(request);
  } catch {
    // Telemetry must never break the CLI.
  }
}

export async function flushTelemetry(timeoutMs = 3000): Promise<void> {
  if (pending.length === 0) return;
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, timeoutMs));
  await Promise.race([Promise.all(pending), timeout]);
}
