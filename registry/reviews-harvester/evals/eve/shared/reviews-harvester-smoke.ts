export const reviewsHarvesterSmokePrompt = [
  "Two new reviews just came in from our Trustpilot feed:",
  '1. (1 star) "The app keeps crashing on export and support never replied. I want a refund."',
  '2. (5 stars) "Absolutely love it. Onboarding was smooth and the team is so helpful."',
  "",
  "Use the draft_responses tool to classify sentiment and flag detractors, then draft a reply for each for my approval. Do not post anything anywhere."
].join("\n");

export const draftResponsesToolName = "draft_responses";

export const expectedReplyPatterns = [/draft/i, /detractor/i] as const;
