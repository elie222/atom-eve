export const kbWriterSmokePrompt = [
  "Review our recent Intercom conversations and draft knowledge base articles for the recurring questions.",
  "",
  "Goal: read recent Intercom conversations, cluster the recurring questions, then present draft knowledge base articles and flag documentation gaps for operator approval.",
  "Use the ticket review tool to read conversation data only. Present each article as a draft with a proposed title and outline. Do not publish articles, edit live docs, or reply to customers."
].join("\n");

export const requiredReplyPatterns = [
  /cluster|recurring/i,
  /draft/i,
  /article/i
] as const;

export const expectedReplyToken = /Intercom/i;
