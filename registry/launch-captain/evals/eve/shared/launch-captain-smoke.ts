export const launchCaptainSmokePrompt = [
  "We're launching our app, TaskFlow, next week.",
  "",
  "Plan a Product Hunt launch playbook: use the plan_launch tool to get the asset checklist, draft copy, and posting schedule, then turn it into operator-ready drafts for my approval. Do not post or schedule anything."
].join("\n");

export const planLaunchToolName = "plan_launch";

export const expectedReplyPatterns = [/launch/i, /TaskFlow/i] as const;
