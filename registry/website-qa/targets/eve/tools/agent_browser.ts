import { defineTool } from "eve/tools";

import { agentBrowserInputSchema, runAgentBrowser, type AgentBrowserInput } from "../lib/browser.js";

export default defineTool({
  description:
    "Run agent-browser for interactive website QA. Use commands for multi-step flows so open, snapshot, click, fill, wait, screenshot, and close share one browser session.",
  inputSchema: agentBrowserInputSchema,
  async execute(input: AgentBrowserInput) {
    return runAgentBrowser(input);
  },
});
