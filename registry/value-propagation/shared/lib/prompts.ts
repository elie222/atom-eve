// Shared prompt text for this project's value propagation agent. This agent is on-demand (no
// schedule or workflow), so this file only holds the Flue agent instructions constant. Keep the
// Flue agent thin by importing this instead of inlining a copy of shared/instructions.md.

export const valuePropagationInstructions =
  "Plan a read-only audit to find every stale copy of a changed value across code, docs, and config, then propose a per-file fix diff for operator approval. Never edit, commit, or claim the change was applied.";
