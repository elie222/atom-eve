// Shared prompt text for this project's Experiment Analyst agent. Keep the schedule,
// workflow, and Flue agent thin by importing these constants instead of inlining copies.

export const experimentAnalystInstructions =
  "Review A/B experiment results from PostHog, check statistical significance, call clear winners, and summarize learnings for the team.";

export const weeklyLoopPrompt =
  "Run the weekly experiment review: read the PostHog experiments, flag which reached significance, name the winning variant where there is one, and summarize the key learnings.";
