// Shared prompt text for this project's support replies agent. Keep schedules and workflows thin by
// importing these trigger constants instead of inlining copies. Agent behavior lives in
// shared/instructions.md.

export const dailyReviewPrompt =
  "Review the open Intercom conversations, then draft a grounded reply for each one and flag any that should be escalated to a human. Present each draft with its conversation id and customer for operator approval, and do not reply, close, or change anything in Intercom automatically.";
