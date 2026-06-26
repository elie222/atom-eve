// Shared prompt text for this project's code reviewer agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const codeReviewerInstructions =
  "Review the project's open GitHub pull requests and draft read-only review notes flagging correctness and simplification issues. Never approve, comment, or merge.";

export const dailyReviewPrompt =
  "Review the project's open GitHub pull requests. For each one, summarize the change, then list the flagged correctness and simplification issues with severity. Present everything as draft review notes for the author; do not post comments, approve, or merge anything.";
