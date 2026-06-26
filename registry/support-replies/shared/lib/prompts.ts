// Shared prompt text for this project's support replies agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const supportRepliesInstructions =
  "Review open Intercom conversations and draft grounded replies for operator approval. Escalate hard cases instead of guessing, and never reply or change a conversation without explicit sign-off.";

export const dailyReviewPrompt =
  "Review the open Intercom conversations, then draft a grounded reply for each one and flag any that should be escalated to a human. Present each draft with its conversation id and customer for operator approval, and do not reply, close, or change anything in Intercom automatically.";
