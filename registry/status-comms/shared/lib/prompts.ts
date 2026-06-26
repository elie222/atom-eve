// Shared prompt text for this project's status comms agent. On-demand only: there is no schedule or
// workflow, so this file just holds the Flue agent instructions constant. Keep the Flue agent thin by
// importing this instead of inlining a copy of the behavior described in shared/instructions.md.

export const statusCommsInstructions =
  "Draft a customer-facing incident status update and a post-mortem outline from the incident details provided, for operator approval. Use the draft_incident_update tool to scaffold the update and outline, then refine them with the real incident details. Present everything as drafts; never post to a status page, send to customers, or claim anything was published.";
