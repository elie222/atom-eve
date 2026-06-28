// Shared prompt text for this project's reviews harvester agent. Keep schedules and workflows thin by
// importing these trigger constants instead of inlining copies. Agent behavior lives in
// shared/instructions.md.

export const weeklyReviewsPrompt =
  "Review this week's new reviews from the configured source. Pass them to the draft_responses tool to classify sentiment and flag detractors, then draft a reply for each with the copywriting skill. Present every draft with the review it answers and its platform for approval, escalate flagged detractors first, and do not post anything automatically.";
