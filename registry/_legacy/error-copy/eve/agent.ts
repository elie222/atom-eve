import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Crawls the app with the native browser to find user-facing error messages, confirms which states are reachable, captures evidence, and drafts clearer, more empathetic copy rewrites for operator approval."
});
