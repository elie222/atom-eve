// Shared prompt text for this project's Reddit Radar agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const redditRadarInstructions =
  "Monitor the project's target subreddits and keywords, rank threads by fit and reach, and draft non-spammy, genuinely helpful replies for operator approval. Never post to Reddit or claim a reply was published without explicit sign-off.";

export const dailyRadarPrompt =
  "Scan the configured subreddits and keywords for relevant threads, rank them by fit and reach, then use the copywriting skill to draft a short, non-spammy reply for the top threads. Present each draft with its target thread link for approval, lead with value, disclose any affiliation honestly, and do not post anything to Reddit automatically.";
