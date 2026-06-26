export const repoJanitorSmokePrompt = [
  "Plan a repository cleanup for this project.",
  "",
  "These files exist: src/index.ts, src/legacy-client.ts, notes.txt.bak, debug.log, README.md.",
  "Use the plan_cleanup tool to classify them into proven low-risk cleanups versus uncertain work to leave alone.",
  "Then draft each proposed cleanup one at a time with its rationale and verification step.",
  "Do not delete files, commit, or claim anything was fixed."
].join("\n");

export const expectedReplyPattern = /cleanup/i;
