import { runAgentBrowser, type AgentBrowserInput } from "../../lib/agents/website-qa/browser.js";

export async function agentBrowser(input: AgentBrowserInput) {
  return runAgentBrowser(input);
}
