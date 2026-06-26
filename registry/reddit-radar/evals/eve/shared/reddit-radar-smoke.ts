export const redditRadarSmokePrompt = [
  "Scan r/SaaS and r/Entrepreneur for threads about cold email deliverability.",
  "",
  "Goal: find the most relevant recent threads, rank them by fit and reach, and draft one short, non-spammy reply for the top-ranked thread.",
  "Use the find_threads tool to gather candidate threads, then draft replies for operator approval. Lead with value and disclose any affiliation honestly.",
  "Present each draft with its target thread link and state clearly that nothing was posted to Reddit."
].join("\n");

export const redditRadarToolName = "find_threads";

export const draftApprovalPattern = /draft|approval/i;
