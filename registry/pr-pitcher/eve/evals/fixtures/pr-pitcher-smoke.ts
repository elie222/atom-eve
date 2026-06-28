export const prPitcherSmokePrompt = [
  "A journalist source request just came in:",
  '"Seeking SaaS founders to share tactics on reducing churn for B2B subscription products. Deadline tomorrow, for a feature in a startup publication."',
  "",
  "Our expertise: B2B SaaS subscription growth and churn reduction.",
  "",
  "Use the draft_pitch tool to score the match and get a response checklist, then draft a quotable reply for my approval. Do not submit it anywhere."
].join("\n");

export const draftPitchToolName = "draft_pitch";

export const expectedReplyPatterns = [/draft/i, /churn/i] as const;
