// Shared trigger prompt text for this project's Reddit Radar agent. Keep schedules and workflows
// thin by importing these constants instead of inlining copies. The agent's behavior summary lives
// in shared/instructions.md.

export const dailyRadarPrompt =
  "Scan the configured subreddits and keywords for relevant threads, rank them by fit and reach, then use the copywriting skill to draft a short, non-spammy reply for the top threads. Present each draft with its target thread link for approval, lead with value, disclose any affiliation honestly, and do not post anything to Reddit automatically.";
