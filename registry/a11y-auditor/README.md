# Accessibility Auditor Agent

## What it does

The Accessibility Auditor Agent is a weekly accessibility monitoring agent for teams that want a repeatable, browser-based view of their WCAG compliance without paying for a hosted scanning service.

It crawls your configured key pages in a real browser, injects and runs axe-core on each loaded page, and reports accessibility issues grouped by **user harm** rather than raw rule ids:

- Keyboard operability
- Screen reader / semantics
- Low vision / text scaling
- Color contrast
- Motion / timing

For every violation it cites the page URL, the WCAG success criterion, the affected selector or element, and a concrete proposed fix.

The MVP uses the target framework's native browser and sandbox command capabilities. It does not install or call a custom audit tool and does not rely on paid scanning APIs. It is strictly read-only: it proposes fixes but never edits, deploys, or remediates code.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add a11y-auditor --target flue
```

or:

```bash
npx atom-eve add a11y-auditor --target eve
```

## Setup

Configure the pages to audit in the prompt you send to the agent, or keep them in your app's local env/config notes and reference those notes from the prompt. For example:

```text
Run the weekly accessibility audit for:
- Home: https://acme.example/
- Pricing: https://acme.example/pricing
- Signup: https://acme.example/signup
Target WCAG 2.2 AA.
```

No API keys are required. If a page requires authentication, configure access in your own project and keep credentials out of this registry package.

The Eve target includes a sandbox bootstrap (`setup-agent-browser.sh`) that installs Agent Browser, Playwright, and axe-core, and creates:

```text
reports/a11y-auditor/history
reports/a11y-auditor/artifacts
```

For Flue, create equivalent directories in the sandbox or let the first run create them with native command execution.

## Usage

Run the weekly schedule or ask the agent directly:

```text
Run the weekly accessibility audit.

Pages:
- Home: https://acme.example/
- Pricing: https://acme.example/pricing

Open each page in the browser, inject and run axe-core, group WCAG violations by user harm with proposed fixes, and compare against reports/a11y-auditor/history if any prior runs exist. Capture screenshots for pages with significant issues and write a new Markdown report plus a compact JSON snapshot.
```

The agent should use native capabilities available in the host framework:

- Run `bash setup-agent-browser.sh` once in a fresh sandbox.
- Use the framework's browser capability (`npx agent-browser ... open`, `snapshot`, `screenshot`) for navigation and evidence.
- Inject `node_modules/axe-core/axe.min.js` into each loaded page and call `axe.run()` to collect violations.
- Store screenshots and raw artifacts under `reports/a11y-auditor/artifacts/<run-id>/`.
- Store the report and compact snapshot under `reports/a11y-auditor/history/<run-id>/`.

Return a concise Markdown report with:

1. Executive summary
2. Pages audited
3. Violations grouped by user harm
4. WCAG success criteria affected
5. Proposed fixes
6. Screenshots and artifacts
7. Notable deltas from prior runs
8. Recommended actions and follow-up questions

## Connections and auth

This package has no external service connection and no required environment variables.

Users provide the pages to audit in the prompt or in local env/config notes. For authenticated areas, wire access in your application and document the allowed access policy locally.

## Limitations

- The agent proposes fixes only. It is read-only and never edits source, opens pull requests, or deploys remediations.
- Automated axe-core checks catch a subset of WCAG issues. Manual review is still required for things like meaningful alt text, logical reading order, and complex keyboard interactions.
- The MVP only compares against files available in `reports/a11y-auditor/history/...`.
- Local history can be lost when sandboxes are ephemeral. DB-backed history, object storage for screenshots, and Slack or email delivery are future work.
- Screenshots and dynamic page capture depend on the target framework's native browser capability being available. If browser automation is blocked, the agent reports the blocker instead of substituting a static HTML or SEO audit.
