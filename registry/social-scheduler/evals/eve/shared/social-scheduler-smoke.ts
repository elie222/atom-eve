export const socialSchedulerSmokePrompt = [
  "Review the current Ayrshare queue and draft this week's posting plan.",
  "",
  "Goal: turn approved content briefs into a draft schedule of posts across X and LinkedIn.",
  "Use the review_queue tool to read the existing queue, then return each post with its copy, target platforms, and a suggested schedule time for operator approval.",
  "Do not auto-post or schedule anything."
].join("\n");

export const expectedApprovalToken = /approval/i;
