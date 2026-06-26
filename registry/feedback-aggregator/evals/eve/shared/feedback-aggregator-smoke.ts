export const feedbackAggregatorSmokePrompt = [
  "Aggregate this week's customer feedback into ranked themes.",
  "",
  "Feedback items:",
  "- ticket: The export button times out on large reports (value 500)",
  "- review: Exports keep timing out for big reports (value 200)",
  "- community: Please add dark mode (value 50)",
  "- ticket: Dark mode would be great (value 50)",
  "- review: Onboarding was confusing (value 100)",
  "",
  "Use the aggregate_feedback tool to dedupe these into themes ranked by frequency x value.",
  "Present the ranked themes as a read-only summary for the team. Do not file tickets, reply to customers, or change anything."
].join("\n");

export const expectedReplyToken = /theme/i;

export const requiredReplyPatterns = [
  /frequency/i,
  /export/i
] as const;
