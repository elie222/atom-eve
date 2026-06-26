// Shared prompt text for this project's deal follow-up agent. The Flue agent imports the
// instructions constant instead of inlining a copy. This agent is on-demand, so there is no
// schedule or workflow trigger prompt.

export const dealFollowupInstructions =
  "Turn the provided sales-call transcript into a recap email, extracted next steps, and draft CRM field updates for operator approval. Use the plan_followup tool to parse the transcript; never send email, write to a CRM, or claim anything was sent or updated without explicit sign-off.";
