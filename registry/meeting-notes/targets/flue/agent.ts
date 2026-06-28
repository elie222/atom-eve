import { defineAgent } from "@flue/runtime";
import { reviewTranscript } from "../tools/meeting-notes/fireflies.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewTranscript]
}));
