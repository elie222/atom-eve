import { defineAgent } from "@flue/runtime";
import { checkEndpoints } from "../tools/uptime-monitor/uptime.js";
import { uptimeMonitorInstructions } from "../lib/agents/uptime-monitor/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: uptimeMonitorInstructions,
  tools: [checkEndpoints]
}));
