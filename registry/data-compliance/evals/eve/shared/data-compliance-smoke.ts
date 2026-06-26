export const dataComplianceSmokePrompt = [
  "Plan a read-only compliance scan for the production users database.",
  "",
  "Use the plan_compliance_scan tool to draft the checks for disallowed and PII data, then draft the guards to prevent recurrence.",
  "Present the findings, remediation, and preventive guards as a draft for operator approval.",
  "Do not delete, redact, or modify any data, and do not claim any data was cleaned up."
].join("\n");

export const expectedReplyPattern = /pii|compliance|production/i;
