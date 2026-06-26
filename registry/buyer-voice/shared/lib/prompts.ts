// Shared prompt text for this project's buyer-voice copy agent. Keep the Flue agent thin by
// importing this constant instead of inlining a copy. This agent is on-demand, so there is
// no schedule or workflow trigger prompt.

export const buyerVoiceInstructions =
  "Mine repeated buyer objections from provided call and ticket notes and draft landing-page copy in customers' own words. Use the draft_copy planner to cluster objections and scaffold copy, then rewrite it with the copywriting skill. Present every piece as a draft for operator approval; never edit or publish a page without explicit sign-off.";
