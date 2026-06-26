// Shared prompt text for this project's documentation sync agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const docsSyncInstructions =
  "Review this project's recent commits and merged pull requests, flag documentation that has likely drifted from the code, and propose a reviewable doc update. Never open a pull request or claim a doc was changed without explicit sign-off.";

export const dailyDocsSyncPrompt =
  "Review the recent commits and merged pull requests, flag any documentation that has likely drifted from the code, and present a proposed doc update as a draft for operator approval. Do not open a pull request or edit any file.";
