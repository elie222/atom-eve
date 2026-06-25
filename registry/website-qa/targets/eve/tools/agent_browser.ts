import { defineTool } from "eve/tools";
import { z } from "zod";

import { runAgentBrowser } from "../lib/browser.js";

const inputSchema = z.object({
  args: z.array(z.string()).min(1).describe('agent-browser arguments, for example ["open", "https://example.com"] or ["snapshot", "-i"].'),
  sessionName: z.string().optional().describe("Optional persistent browser session name for this QA run."),
  allowedDomains: z.array(z.string()).optional().describe("Optional domain allowlist, for example ['example.com', '*.example.com']."),
  maxOutputChars: z.number().int().positive().optional().describe("Maximum stdout/stderr characters to return."),
});

type AgentBrowserToolInput = z.infer<typeof inputSchema>;

export default defineTool({
  description:
    "Run one agent-browser CLI command for interactive website QA. Use snapshot -i to discover refs, then click/fill/wait/screenshot as needed.",
  inputSchema,
  async execute(input: AgentBrowserToolInput) {
    return runAgentBrowser(input);
  },
});
