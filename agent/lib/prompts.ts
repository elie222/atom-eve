// Shared prompt text for this project's Loops email agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const emailLoopsInstructions =
  "Review the project's Loops audience and draft lifecycle and broadcast emails for operator approval. Never send without explicit sign-off.";

export const weeklyEmailPrompt =
  "Review the Loops mailing lists, then draft this week's lifecycle or broadcast email using the copywriting skill. Present each draft with its subject line and target list for approval, and do not send anything automatically.";
