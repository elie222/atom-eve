# UX Reviewer Agent

A read-only UX agent that walks a real user task in the browser and scores each screen.

## What it does

Walks a real user task end to end in the browser the way a product-minded designer would, scores each screen along the way, and recommends improvements to the weakest spots. It is for teams that want a repeatable, evidence-backed read on where a key flow loses users.

This is a read-only review agent: it observes and recommends and never changes, fixes, deploys, or submits anything for real. It drives a real browser (Agent Browser) in the eve sandbox via the built-in `bash` tool, following the open -> snapshot -> act -> screenshot loop. The capability is the browser; every score and recommendation is the LLM's judgment grounded in an observed screen.

It reports on:

- The user task and the screens walked to complete it
- A per-screen score on clarity, effort, error prevention, and confidence
- The weakest screens ranked by score and impact on task completion
- Concrete, prioritized improvement recommendations for those weak spots
- Screenshots captured for each screen

## Supported targets

- `eve`

## Install

```bash
npx atom-eve add ux-reviewer
```

This copies the agent into `agent/` in your eve app.

## Setup

No API keys or environment variables are required. The installed sandbox bootstrap prepares Agent Browser and a Chromium runtime inside the eve sandbox and creates `reports/ux-reviewer/assets` on first run, so the first browser run may spend extra time while the sandbox template is built.

Customize `agent/instructions.md` with this project's real product, primary user tasks, design heuristics, and reporting preferences. Configure the task and starting URL in the prompt you send the agent, or keep them in local env/config notes and reference those notes from the prompt. For authenticated apps, configure access in your own project and keep credentials out of this registry package.

## Usage

Ask the agent directly, or let the bundled weekly schedule (Mondays at 09:00 UTC) run the configured review. Example prompt:

```text
Review the user task: a first-time visitor signs up and reaches the first onboarding screen at https://app.example/.

Do not submit payment, bypass CAPTCHA, or use real credentials. Walk the natural path screen by screen, capture a screenshot per screen under reports/ux-reviewer/assets/, score each screen, and recommend read-only improvements for the weakest spots.
```

The schedule runs in task mode: eve starts the agent on its cron tick and the review lands in that run's session (inspect it via the eve channel session stream). There is no external channel — the review is the session output. Wire the response to your own Slack, GitHub, database, or storage workflow if you need persisted UX history.

## Connections and auth

This agent has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the eve sandbox, and there is no auth by default. For authenticated apps, create a browser session/profile manually outside this package and adapt the instructions to pass the relevant Agent Browser flags. Do not commit session state or credentials.

## Limitations

- Browser automation depends on `agent-browser` being available in the eve sandbox. If it is unavailable, the agent reports the blocker instead of doing a static audit.
- Scores are heuristic LLM judgments grounded in observed screens, not quantitative analytics. Pair them with real usage data when prioritizing work.
- The agent is read-only: it recommends improvements but never implements, deploys, or submits anything.
- Screenshots and reports are session-local artifacts; wire them to your own storage if you need long-term history.
- Keep app-specific URLs, credentials, and task definitions in your app repo, not in the registry package.
