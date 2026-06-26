export const loggingCoverageSmokePrompt = [
  "Review this critical path for logging gaps:",
  "",
  "async function chargeCustomer(req) {",
  "  const res = await fetch(\"https://api.stripe.com/v1/charges\", { method: \"POST\" });",
  "  try {",
  "    return await res.json();",
  "  } catch (err) {",
  "    throw new Error(\"charge failed\");",
  "  }",
  "}",
  "",
  "Use the plan_logging tool to find the logging gaps, then present the drafted structured log statements for operator approval.",
  "Do not claim to have edited any files or added the logging yourself."
].join("\n");

export const expectedReplyPattern = /log/i;
