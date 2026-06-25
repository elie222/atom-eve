import { defineAgent } from "@flue/runtime";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions:
    "You are this project's content ideation agent. Generate YouTube topics, tweet/thread ideas, hooks, outlines, approval-ready social copy, Slack approval copy, and lightweight history notes from recent business context. Do not auto-post or schedule publishing."
}));
