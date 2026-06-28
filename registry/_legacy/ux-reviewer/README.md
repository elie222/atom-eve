# UX Reviewer Agent

## What it does

The UX Reviewer Agent walks a real user task in the browser the way a product-minded designer would, scores each screen along the way, and recommends improvements to the weakest spots. It is for teams that want a repeatable, evidence-backed read on where a key flow loses users.

This is a read-only review agent. It observes and recommends; it never changes, fixes, deploys, or submits anything for real.

It reports on:

- The user task and the screens walked to complete it
- A per-screen score on clarity, effort, error prevention, and confidence
- The weakest screens ranked by score and impact on task completion
- Concrete, prioritized improvement recommendations for those weak spots
- Screenshots captured for each screen

The agent uses the target framework's native sandbox command capability to drive Agent Browser. It does not build a custom browser wrapper tool and does not run a static HTML or SEO audit in place of a real walkthrough.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add ux-reviewer --target flue
```

or:

```bash
npx atom-eve add ux-reviewer --target eve
```

## Setup

For Eve, no custom tool dependency is required. The installed sandbox bootstrap prepares Agent Browser inside the Eve sandbox and creates `reports/ux-reviewer/assets`. The first browser run may spend extra time while the sandbox template is built.

For Flue Node.js with a local sandbox, install Agent Browser where the sandbox can run commands:

```bash
pnpm add agent-browser
agent-browser install
```

If your project uses pnpm 10 build approvals, allow the Agent Browser install script:

```yaml
# pnpm-workspace.yaml
allowBuilds:
  agent-browser: true
```

For Cloudflare or another isolated Flue sandbox, install Agent Browser as part of that sandbox's setup/lifecycle rather than through an application tool.

Customize the installed instructions with this project's real product, primary user tasks, design heuristics, and reporting preferences. Configure the task and starting URL in the prompt you send the agent, or keep them in local env/config notes and reference those notes from the prompt:

```text
Review the signup-to-first-value task for:
- App: https://app.example/ starting from the homepage CTA
- Goal: a new visitor creates an account and reaches the first useful screen
```

No API keys are required. For authenticated apps, configure access in your own project and keep credentials out of this registry package.

## Usage

Run the weekly schedule or ask the agent directly:

```text
Review the user task: a first-time visitor signs up and reaches the first onboarding screen at https://app.example/.

Do not submit payment, bypass CAPTCHA, or use real credentials. Walk the natural path screen by screen, capture a screenshot per screen under reports/ux-reviewer/assets/, score each screen, and recommend read-only improvements for the weakest spots.
```

The agent should use built-in sandbox command calls with Agent Browser:

```bash
npx agent-browser --session ux-reviewer open https://example.com
npx agent-browser --session ux-reviewer snapshot -i
npx agent-browser --session ux-reviewer screenshot reports/ux-reviewer/assets/screen-01.png
```

Return a concise Markdown report with:

1. Executive summary
2. Task and screens walked
3. Per-screen scores
4. Weakest spots
5. Recommended improvements
6. Screenshots/artifacts
7. Follow-up test prompt

If your app needs persisted UX history, wire the response to your own Slack, GitHub, database, or artifact storage workflow.

## Connections and auth

This package has no external service connection and no required environment variables. Browser automation runs through the `agent-browser` CLI inside the framework sandbox, and there is no auth by default.

For authenticated apps, create a browser session/profile manually outside this package and adapt the installed instructions to pass the relevant Agent Browser flags. Do not commit session state or credentials.

## Limitations

- Browser automation depends on `agent-browser` being available in the runtime environment or Eve sandbox. If it is unavailable, the agent reports the blocker instead of doing a static audit.
- Scores are heuristic judgments grounded in observed screens, not quantitative analytics. Pair them with real usage data when prioritizing work.
- The agent is read-only: it recommends improvements but never implements, deploys, or submits anything.
- Screenshots and reports are local artifacts; wire them to your own storage if you need long-term history.
- Keep app-specific URLs, credentials, and task definitions in your app repo, not in the registry package.
