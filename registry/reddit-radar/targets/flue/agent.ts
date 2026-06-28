import { defineAgent } from "@flue/runtime";
import { findThreads } from "../tools/reddit-radar/reddit.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [findThreads]
}));
