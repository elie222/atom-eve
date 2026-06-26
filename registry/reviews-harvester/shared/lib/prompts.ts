// Shared prompt text for this project's reviews harvester agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const reviewsHarvesterInstructions =
  "Watch new product reviews from the configured source, draft on-brand responses, and flag detractors for operator approval. Never post a reply without explicit sign-off.";

export const weeklyReviewsPrompt =
  "Review this week's new reviews from the configured source. Pass them to the draft_responses tool to classify sentiment and flag detractors, then draft a reply for each with the copywriting skill. Present every draft with the review it answers and its platform for approval, escalate flagged detractors first, and do not post anything automatically.";
