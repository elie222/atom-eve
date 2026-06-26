import { defineAgent } from "@flue/runtime";
import { draftIncidentUpdate } from "../tools/status-comms/statuscomms.js";
import { statusCommsInstructions } from "../lib/agents/status-comms/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: statusCommsInstructions,
  tools: [draftIncidentUpdate]
}));
