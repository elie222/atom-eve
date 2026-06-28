// Shared prompt text for this project's uptime monitor agent. Keep the schedule and workflow thin
// by importing these constants instead of inlining copies. The agent's behavior now lives in
// shared/instructions.md.

export const frequentCheckPrompt =
  "Check this project's configured endpoints with the check_endpoints tool, then summarize the health report: include the HTTP status and latency for each endpoint and flag anything down or degraded. This is read-only monitoring; do not attempt any remediation. If no endpoints are configured, say so and stop.";
