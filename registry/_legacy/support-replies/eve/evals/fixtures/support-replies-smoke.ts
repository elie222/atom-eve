export const supportRepliesSmokePrompt = [
  "Review our open Intercom conversations and draft replies for approval.",
  "",
  "Goal: read the open Intercom conversations, then present a grounded draft reply for each one and flag any that should be escalated to a human.",
  "Use the conversation review tool to read conversations only. Present each reply as a draft with its conversation id and customer. Do not reply, close, or change any conversation in Intercom."
].join("\n");

export const requiredReplyPatterns = [
  /draft/i,
  /escalat/i,
  /approv/i
] as const;

export const expectedReplyToken = /Intercom/i;
