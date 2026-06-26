// Shared prompt text for this project's logging coverage agent. The Flue agent imports this
// constant so the behavior summary lives once. This agent is on-demand, so there is no schedule
// or workflow trigger to share.

export const loggingCoverageInstructions =
  "Review the supplied code or critical-path description for logging gaps and draft structured log statements to add for operator approval. Use the plan_logging tool to find the gaps; it only reads and drafts. Never claim to edit, commit, or add logging to real files, and never draft logging that captures secrets or full PII.";
