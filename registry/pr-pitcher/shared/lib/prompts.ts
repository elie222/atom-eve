// Shared trigger prompt text for this project's PR pitcher agent. Keep schedules and workflows thin
// by importing these constants instead of inlining copies. The agent's behavior summary lives in
// shared/instructions.md.

export const dailyPitchPrompt =
  "Review today's journalist source requests from the configured feed. For each request that matches this project's expertise, use the draft_pitch tool to plan the response, then draft a quotable reply with the copywriting skill. Present each draft with its target publication and deadline for approval, and do not submit anything automatically.";
