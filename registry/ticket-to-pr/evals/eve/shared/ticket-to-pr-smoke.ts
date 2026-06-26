export const ticketToPrSmokePrompt = [
  "Read Linear ticket ENG-123 and draft a PR plan.",
  "",
  "Goal: read the ticket via the review tool, then draft a reviewer-ready PR plan for operator approval.",
  "Include a reproduction or root-cause hypothesis, a step-by-step implementation plan, and a test plan. Only read the ticket. Do not open, push, or merge a PR, and do not edit the ticket."
].join("\n");

export const requiredReplyPatterns = [
  /reproduction|root[- ]cause/i,
  /implementation plan/i,
  /test plan/i
] as const;

export const expectedReplyToken = /ticket|Linear/i;
