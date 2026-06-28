export const frequentCheckPrompt =
  "Check this project's configured endpoints with the check_endpoints tool, then summarize the health report: include the HTTP status and latency for each endpoint and flag anything down or degraded. This is read-only monitoring; do not attempt any remediation. If no endpoints are configured, say so and stop.";
