import { defineAgent } from "@flue/runtime";
import { draftIncidentUpdate } from "../tools/status-comms/statuscomms.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [draftIncidentUpdate]
}));
