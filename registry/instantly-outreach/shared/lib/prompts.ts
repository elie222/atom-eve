// Shared trigger prompt text for this project's Instantly outreach agent. Keep the schedule and
// workflow thin by importing this constant instead of inlining a copy. Agent behavior lives in
// shared/instructions.md.

export const outreachLoopPrompt =
  "Pull fresh ICP leads from Apollo with the review_outreach tool and review recent Instantly campaign performance (open, reply, and positive-reply rates). Dedupe the leads against prior runs, then use the copywriting skill to draft a cold-email campaign with a 3-4 step follow-up sequence, modeling tone on the best-performing campaign. Present the lead list, the performance review, and every email draft with its subject line, step, and send delay for operator approval. Do not create or launch anything in Instantly.";
