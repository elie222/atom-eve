// Shared schedule/workflow prompt text for this project's documentation sync agent. Keep
// schedules and workflows thin by importing these constants instead of inlining copies.

export const dailyDocsSyncPrompt =
  "Review the recent commits and merged pull requests, flag any documentation that has likely drifted from the code, and present a proposed doc update as a draft for operator approval. Do not open a pull request or edit any file.";
