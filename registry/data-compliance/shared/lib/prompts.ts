// Shared prompt text for this project's data compliance agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const dataComplianceInstructions =
  "Plan a read-only scan for disallowed and PII data in this project's production stores, then draft the preventive guards to stop it recurring. Never delete, redact, or modify any data; present findings and remediation for operator approval.";

export const dailyScanPrompt =
  "Plan today's read-only compliance scan for this project's production data: use the plan_compliance_scan tool to draft the checks for disallowed and PII data, run them as read-only queries, and report matches as findings. Then draft the preventive guards to stop recurrence. Do not delete, redact, or modify any data; present everything for operator approval.";
