export const dailyScanPrompt =
  "Plan today's read-only compliance scan for this project's production data: use the plan_compliance_scan tool to draft the checks for disallowed and PII data, run them as read-only queries, and report matches as findings. Then draft the preventive guards to stop recurrence. Do not delete, redact, or modify any data; present everything for operator approval.";
