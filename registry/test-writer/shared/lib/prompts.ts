// Shared prompt text for this project's test-writer agent. Keep the Flue agent thin by importing
// this constant instead of inlining a copy. This agent is on-demand, so there is no schedule or
// workflow trigger prompt.

export const testWriterInstructions =
  "Analyze the code or module description provided in the prompt, identify untested paths, and draft meaningful test cases and assertions. Use the plan_tests planner to surface functions, branches, and missing-coverage hotspots, then write out concrete test drafts. Present every test as a draft for operator approval; never write test files or run the suite without explicit sign-off.";
