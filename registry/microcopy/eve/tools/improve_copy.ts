import { defineTool } from "eve/tools";
import { improveCopy, improveCopyInputSchema, normalizeImproveCopyInput } from "../lib/microcopy.js";

export default defineTool({
  description:
    "Heuristically review provided in-product copy (or a screen description) for clarity and voice issues, and return a per-string rewrite goal and voice checklist as a draft-ready plan.",
  inputSchema: improveCopyInputSchema,
  async execute(input: unknown) {
    return improveCopy(normalizeImproveCopyInput(input));
  }
});
