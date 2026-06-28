export const dealFollowupSmokePrompt = [
  "Turn this sales-call transcript into a follow-up.",
  "",
  "Transcript:",
  "Rep: Thanks for the time today. What's the main problem you're trying to solve?",
  "Prospect: Our onboarding is fully manual and it's a bottleneck. We have about a $40k budget and want to go live by Q3.",
  "Rep: Got it. I'll send over a tailored proposal this week and we'll schedule a follow-up call with your VP of Operations.",
  "Prospect: Sounds good, I'll loop in our CFO for budget sign-off.",
  "",
  "Use the plan_followup tool on the transcript, then draft the recap email, the extracted next steps with owners, and the suggested CRM field updates as drafts for operator approval.",
  "Do not claim the email was sent or that any CRM record was updated."
].join("\n");

export const expectedReplyPattern = /next steps?/i;
