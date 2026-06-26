// Shared prompt text for this project's ticket-to-PR agent. This agent is on-demand (no schedule
// or workflow), so the only shared constant is the Flue agent's instructions. Keep the Flue agent
// thin by importing this instead of inlining a copy.

export const ticketToPrInstructions =
  "Read the referenced Linear ticket and draft a reviewer-ready PR plan: a reproduction or root-cause hypothesis, a step-by-step implementation plan, and a test plan. Present everything as a draft for operator approval. Only read the ticket; never open, push, or merge a PR.";
