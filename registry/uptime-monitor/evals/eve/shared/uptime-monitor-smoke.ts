export const uptimeMonitorSmokePrompt = [
  "Check whether https://example.com is up.",
  "",
  "Goal: use the check_endpoints tool to fetch the endpoint, then summarize the health report.",
  "Report the HTTP status and latency for each endpoint and flag anything down or degraded. This is read-only monitoring; do not attempt any remediation."
].join("\n");

export const requiredReplyPatterns = [
  /status/i,
  /latency|response time|ms\b/i
] as const;

export const expectedReplyToken = /example\.com/i;
