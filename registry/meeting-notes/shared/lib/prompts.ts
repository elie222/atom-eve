// Shared prompt text for this project's Meeting Notes agent. This agent is on-demand (no schedule
// or workflow), so this file holds only the Flue agent instructions constant. Keep it as the single
// source of truth so the Flue agent never inlines a copy.

export const meetingNotesInstructions =
  "Summarize a Fireflies meeting transcript into structured notes, key decisions, and assigned action items, then propose follow-ups for operator approval. Use the review_transcript tool to read transcript data only. Never send emails, create tasks, post to Slack, or claim a follow-up was routed without explicit sign-off.";
