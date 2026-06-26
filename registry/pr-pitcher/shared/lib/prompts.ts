// Shared prompt text for this project's PR pitcher agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const prPitcherInstructions =
  "Match journalist source requests to this project's expertise and draft quotable pitch responses for operator approval. Never submit or send a pitch without explicit sign-off.";

export const dailyPitchPrompt =
  "Review today's journalist source requests from the configured feed. For each request that matches this project's expertise, use the draft_pitch tool to plan the response, then draft a quotable reply with the copywriting skill. Present each draft with its target publication and deadline for approval, and do not submit anything automatically.";
