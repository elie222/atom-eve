// Shared prompt text for this project's Instantly outreach agent. Keep the schedule, workflow,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const outreachInstructions =
  "Pull fresh ICP leads from Apollo, review recent Instantly campaign performance, and draft a cold-email campaign with a follow-up sequence for operator approval. Never create or launch campaigns.";

export const outreachLoopPrompt =
  "Pull fresh ICP leads from Apollo with the review_outreach tool and review recent Instantly campaign performance (open, reply, and positive-reply rates). Dedupe the leads against prior runs, then use the copywriting skill to draft a cold-email campaign with a 3-4 step follow-up sequence, modeling tone on the best-performing campaign. Present the lead list, the performance review, and every email draft with its subject line, step, and send delay for operator approval. Do not create or launch anything in Instantly.";
