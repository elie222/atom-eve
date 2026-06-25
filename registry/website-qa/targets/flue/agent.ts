import { defineAgent } from "@flue/runtime";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions:
    "Run browser-driven QA on a website or web app. Use the sandbox command capability to run npx agent-browser commands, inspect and interact with onboarding/signup flows, capture screenshots, and then return a concise Markdown QA report."
}));
