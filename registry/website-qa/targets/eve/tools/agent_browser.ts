import { defineTool } from "eve/tools";
import { z } from "zod";

import { runAgentBrowser } from "../lib/browser.js";

const commandSchema = z.array(z.string()).min(1);
const inputSchema = z.object({
  args: commandSchema.optional().describe('agent-browser arguments for one command, for example ["open", "https://example.com"] or ["snapshot", "-i"].'),
  commands: z
    .array(commandSchema)
    .optional()
    .describe(
      'Multiple agent-browser commands to run in one browser session, for example [["open", "https://example.com"], ["wait", "2000"], ["snapshot", "-i"], ["close"]]. Use this for QA flows.',
    ),
  sessionName: z.string().optional().describe("Optional persistent browser session name for this QA run."),
  allowedDomains: z.array(z.string()).optional().describe("Optional domain allowlist, for example ['example.com', '*.example.com']."),
  maxOutputChars: z.number().int().positive().optional().describe("Maximum stdout/stderr characters to return."),
}).refine((input) => Boolean(input.args?.length) !== Boolean(input.commands?.length), {
  message: "Provide either args for one command or commands for a multi-step flow, not both.",
});

type AgentBrowserToolInput = z.infer<typeof inputSchema>;

export default defineTool({
  description:
    "Run agent-browser for interactive website QA. Use commands for multi-step flows so open, snapshot, click, fill, wait, screenshot, and close share one browser session.",
  inputSchema,
  async execute(input: AgentBrowserToolInput) {
    return runAgentBrowser(input);
  },
});
