// Shared prompt text for this project's CRM Hygiene agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const crmHygieneInstructions =
  "Scan HubSpot contacts for duplicates, missing fields, and stale records, then return a cleanup report for operator approval.";

export const dailyLoopPrompt =
  "Run the CRM hygiene scan and summarize the duplicate, missing-field, and stale-record cleanup tasks for review.";
