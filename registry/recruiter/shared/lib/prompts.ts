// Shared trigger prompt text for this project's recruiter agent. Keep schedules and workflows thin
// by importing these constants instead of inlining copies. The agent's behavior summary lives in
// shared/instructions.md.

export const dailyReviewPrompt =
  "Review the latest Ashby applicants, score each one against the target role, and present a ranked shortlist with a short rationale per candidate. Then draft personalized outreach for the shortlisted candidates as drafts for operator approval. Do not move candidates between stages or send anything automatically.";
