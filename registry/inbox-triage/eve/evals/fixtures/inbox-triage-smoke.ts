export const inboxTriageSmokePrompt = [
  "Triage my Gmail inbox for today.",
  "",
  "Goal: read the inbox, classify each message, flag the noise to label or archive, and draft replies for the messages that need one.",
  "Use the inbox review tool to read messages only. Present every label, archive, and reply as a draft for operator approval. Do not modify the inbox or send anything."
].join("\n");

export const requiredReplyPatterns = [
  /triage/i,
  /draft/i,
  /archive/i
] as const;

export const expectedReplyToken = /inbox/i;
