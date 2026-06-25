---
name: qa-brief
description: Customize this QA brief for the product flow you want the Website QA Agent to test.
---

Run a browser-driven QA pass for the target website or web app.

Default workflow:

- Start from the supplied public URL.
- Find the natural path for the requested user goal, such as signup, onboarding, checkout, or project creation.
- Use snapshots to identify controls before clicking or filling.
- Re-snapshot after each navigation, modal, validation state, or form submit.
- Capture screenshots for the start state, important intermediate states, blockers, and final state.
- Do not bypass CAPTCHA, payment, email verification, OAuth consent, or other external trust gates.
- Do not use real credentials unless the user explicitly supplies test credentials for this run.
- If a required input is missing, stop before submitting and report exactly what is needed.
- Test mobile or desktop only when requested, otherwise use the default browser viewport.

Report format:

- Summary
- Result: passed, blocked, failed, or incomplete
- Flow steps attempted
- Critical findings
- Major findings
- Minor findings
- Screenshots and evidence
- Recommended next actions
- Exact follow-up prompt to rerun after fixes

Customize this file after installation with product-specific flows, personas, test credentials policy, routes, and acceptance criteria.
