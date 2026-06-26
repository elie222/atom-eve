# Error Copy Agent

## What it does

The Error Copy Agent crawls your app with a native browser to find user-facing error messages, confirms which error states are actually reachable, and drafts clearer, more empathetic rewrites for operator approval. It is for teams that want a repeatable weekly pass over their error and edge-case copy without paying for an external service.

It reviews error states such as:

- Form validation errors (required fields, invalid email, password rules)
- HTTP status and error pages such as 404, 403, 500, and maintenance screens
- Empty states and zero-result views
- Permission denials and access-blocked messages
- Failed-action toasts, banners, and inline errors

For each message it records the exact current copy, the URL and steps that triggered it, a screenshot or artifact, and whether the state is reachable or only theoretical. It then proposes before/after rewrites that improve clarity, tone, and next-step guidance.

This agent is read-only and draft-first. It never edits code or copy, never submits destructive actions, and never uses real credentials, payment, or CAPTCHA bypass. Every rewrite is presented as a draft for you to approve. It uses the target framework's native browser, fetch, and sandbox command capabilities and does not install or call a custom browser wrapper tool.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add error-copy --target flue
```

or:

```bash
npx atom-eve add error-copy --target eve
```

## Setup

Configure the app URLs and flows to review in the prompt you send to the agent, or keep them in your app's local env/config notes and reference those notes from the prompt. For example:

```text
Run the weekly error copy review for:
- Signup: https://app.example/signup (submit empty and invalid inputs)
- Missing page: https://app.example/does-not-exist
- Empty state: https://app.example/projects (new account)
```

No API keys are required. If a flow requires authentication, configure access in your own project and keep credentials out of this registry package.

For Eve, no custom tool dependency is required. The installed sandbox bootstrap runs `setup-agent-browser.sh` to prepare the native browser inside the Eve sandbox and creates `reports/error-copy/artifacts`. The first browser run may spend extra time while the sandbox template is built.

For Flue Node.js with a local sandbox, install the browser where the sandbox can run commands:

```bash
pnpm add agent-browser
agent-browser install
```

For Cloudflare or another isolated Flue sandbox, install the browser as part of that sandbox's setup/lifecycle rather than through an application tool. If the browser is unavailable, the agent should report that the review is blocked rather than silently doing a static HTML audit.

## Usage

Run the weekly schedule or ask the agent directly:

```text
Run the weekly error copy review.

App flows:
- Signup: https://app.example/signup
- Missing page: https://app.example/does-not-exist
- Empty state: https://app.example/projects

Trigger reachable error states, capture screenshots under reports/error-copy/artifacts, record the exact current copy, and present before/after rewrite drafts. Do not change anything or use real credentials.
```

The agent uses native capabilities available in the host framework:

- Use the browser to navigate flows, trigger reachable error states, inspect snapshots, and capture screenshots.
- Use fetch or sandbox commands such as `curl` for HTTP status checks and raw artifacts.
- Store screenshots and artifacts under `reports/error-copy/artifacts/<YYYY-MM-DD>/`.

Return a concise Markdown report with:

1. Executive summary
2. Pages and flows crawled
3. Error messages found, with current copy, trigger state, and evidence
4. Reachable vs. unverified error states
5. Rewrite drafts (before / after) with rationale
6. Recommended actions and follow-up questions

## Connections and auth

This package has no external service connection and no required environment variables. It uses browser automation through the framework sandbox, with no auth by default.

Users provide app URLs and flows in the prompt or in local env/config notes. For authenticated apps, create a browser session/profile outside this package and document the allowed access policy locally. Do not commit session state or credentials.

## Limitations

- Browser automation depends on the native browser being available in the runtime environment or Eve sandbox.
- The agent only reviews URLs and flows you configure; it does not discover routes on its own.
- Screenshots and reports are local artifacts; wire them to your own storage if you need long-term history.
- The agent drafts rewrites only. Applying approved copy to your codebase is out of scope and remains a manual or separate step.
- Keep app-specific URLs, credentials, and copy guidelines in your app repo, not in the registry package.
