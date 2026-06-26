export const valuePropagationSmokePrompt = [
  "A configuration value changed in this project and I need to find every stale copy of it.",
  "",
  "The old value is \"https://old.example.com\" and the new value is \"https://new.example.com\".",
  "Use the plan_propagation tool to plan a read-only audit across code, docs, and config, then present the search terms and an ordered fix plan.",
  "Present the proposed old -> new edits as a diff for approval. Do not edit files, commit, or claim the value was changed."
].join("\n");

export const expectedReplyPattern = /audit|propagat/i;
