import { defineAgent } from "@flue/runtime";
import { reviewTranscript } from "../tools/meeting-notes/fireflies.js";
import { meetingNotesInstructions } from "../lib/agents/meeting-notes/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: meetingNotesInstructions,
  tools: [reviewTranscript]
}));
