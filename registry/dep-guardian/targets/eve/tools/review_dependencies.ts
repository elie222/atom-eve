import { defineTool } from "eve/tools";
import {
  normalizeReviewDependenciesInput,
  reviewDependencies,
  reviewDependenciesInputSchema
} from "../lib/github.js";

export default defineTool({
  description:
    "Read package.json from the configured GitHub repository and return outdated/risky dependencies in risk order with proposed grouped updates.",
  inputSchema: reviewDependenciesInputSchema,
  async execute(input: unknown) {
    return reviewDependencies(normalizeReviewDependenciesInput(input));
  }
});
