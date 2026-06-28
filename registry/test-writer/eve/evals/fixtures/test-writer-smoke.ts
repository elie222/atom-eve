export const testWriterSmokePrompt = [
  "Identify the untested paths in this module and draft meaningful test cases with assertions.",
  "",
  "Framework: vitest",
  "Code:",
  "```ts",
  "export function divide(a: number, b: number): number {",
  "  if (b === 0) {",
  "    throw new Error('cannot divide by zero');",
  "  }",
  "  return a / b;",
  "}",
  "```",
  "",
  "Use the plan_tests planner to surface the functions and branches first, then write the test drafts.",
  "Present them as drafts for operator approval; do not write any test files or run the suite."
].join("\n");

export const testWriterEveToolName = "plan_tests";

export const testWriterReplyPattern = /test|assert|untested|divide/i;
