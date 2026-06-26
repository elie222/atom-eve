import { defineAgent } from "@flue/runtime";
import { draftRestoreCheck } from "../tools/backup-verifier/backup.js";
import { backupVerifierInstructions } from "../lib/agents/backup-verifier/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: backupVerifierInstructions,
  tools: [draftRestoreCheck]
}));
