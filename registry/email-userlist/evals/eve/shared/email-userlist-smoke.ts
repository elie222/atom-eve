export const emailUserlistSmokePrompt = [
  "Plan a Userlist lifecycle email campaign for the onboarding stage.",
  "",
  "Use the plan_campaign tool to suggest the events and traits to push for the onboarding lifecycle stage.",
  "Then draft the message copy for each suggested event, presenting every email as a draft for operator approval with its subject line and triggering event.",
  "Do not push events, set traits, trigger campaigns, or claim an email was sent."
].join("\n");

export const expectedReplyPattern = /onboarding/i;
