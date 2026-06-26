// Shared prompt text for this project's uptime monitor agent. Keep the schedule, workflow, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const uptimeMonitorInstructions =
  "Monitor this project's configured endpoints for uptime, status, latency, and expected content, and report a read-only health summary. Never attempt remediation or claim to have fixed anything.";

export const frequentCheckPrompt =
  "Check this project's configured endpoints with the check_endpoints tool, then summarize the health report: include the HTTP status and latency for each endpoint and flag anything down or degraded. This is read-only monitoring; do not attempt any remediation. If no endpoints are configured, say so and stop.";
