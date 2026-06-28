export const contentIdeationSmokePrompt = [
  "Generate a small content queue for this project.",
  "",
  "Recent context: we shipped a one-click onboarding flow this week, support keeps asking how to import existing data, and our founder wants to push the 'switch in under 5 minutes' angle.",
  "Produce a few YouTube topics, tweet/thread ideas, hooks, outlines, and approval-ready social copy plus Slack approval copy.",
  "Mark every item as proposed and not posted. Do not invent customer names, metrics, quotes, or facts, and do not call Slack or Postiz APIs or claim anything was published.",
  "Return the sections in the documented order."
].join("\n");

export const requiredSectionPatterns = [
  /Source context used/i,
  /Repetition check/i,
  /YouTube topics/i,
  /Tweet\/?thread ideas/i,
  /Hooks bank/i,
  /Outlines/i,
  /Approval[- ]ready social copy/i,
  /Slack approval copy/i,
  /History update notes/i
] as const;

export const expectedTokenPattern = /proposed/i;
