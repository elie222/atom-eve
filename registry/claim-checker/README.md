# Claim Checker Agent

## What it does

The Claim Checker Agent is a weekly compliance and messaging-hygiene agent for teams that want to keep their marketing site honest without paying for search or monitoring APIs.

It crawls the configured marketing site, inventories every customer-facing claim, and checks each claim against product reality. It then flags and drafts repairs for the riskiest overstatements. The agent reports on:

- A full claim inventory with exact wording and source URL
- Claim type (capability, performance/metric, comparison, compliance/security, pricing, guarantee, integration, social proof)
- A verdict per claim: supported, unverified, or overstated, with the supporting evidence
- A risk ranking of the most dangerous overstatements
- Draft repairs that keep marketing intent but are defensible against the evidence
- Screenshots and saved artifacts
- Notable deltas from prior runs

The MVP uses the target framework's native browser, fetch, and sandbox command capabilities. It does not install or call a custom browser wrapper tool and does not rely on paid search APIs. It is read-only: it never edits, publishes, or ships copy. Suggested repairs are drafts for a human to review and apply.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add claim-checker --target flue
```

or:

```bash
npx atom-eve add claim-checker --target eve
```

## Setup

Configure your marketing site URLs and your product sources of truth in the prompt you send to the agent, or keep them in your app's local env/config notes and reference those notes from the prompt. For example:

```text
Run the weekly claim check for:
- Homepage: https://acme.example/
- Pricing: https://acme.example/pricing
- Comparison: https://acme.example/vs-competitor

Verify claims against:
- Docs: https://docs.acme.example/
- Changelog: https://acme.example/changelog
- Internal notes on shipped vs. roadmap features
```

No API keys are required. If a page requires authentication, configure access in your own project and keep credentials out of this registry package.

The Eve target includes a lightweight sandbox bootstrap that creates:

```text
reports/claim-checker/history
reports/claim-checker/artifacts
```

and runs `bash setup-agent-browser.sh` to install Agent Browser the first time the sandbox starts. For Flue, create equivalent directories in the sandbox or let the first run create them with native command execution, and run `bash setup-agent-browser.sh` before the first Agent Browser command.

## Usage

Run the weekly schedule or ask the agent directly:

```text
Run the weekly claim check.

Marketing pages:
- https://acme.example/
- https://acme.example/pricing
- https://acme.example/security

Sources of truth:
- https://docs.acme.example/
- https://acme.example/changelog

Compare against reports/claim-checker/history if any prior runs exist. Capture screenshots for pages with high-risk claims and write a new Markdown report plus a compact JSON snapshot.
```

The agent should use native capabilities available in the host framework:

- Use fetch or sandbox commands such as `curl` or `node -e` to collect page text and metadata.
- Use the framework's Agent Browser capability for pages where layout, screenshots, dynamic content, or rendered claims matter. Run `bash setup-agent-browser.sh` once per fresh sandbox first.
- Store screenshots and raw artifacts under `reports/claim-checker/artifacts/<run-id>/`.
- Store the report and compact snapshot under `reports/claim-checker/history/<run-id>/`.

Return a concise Markdown report with:

1. Executive summary
2. Pages and claims reviewed
3. Claim inventory with source URL, type, and verdict
4. Risk assessment ordered by severity
5. Flagged overstatements
6. Suggested repairs (drafts only)
7. Screenshots and artifacts
8. Notable deltas from prior runs
9. Recommended actions and follow-up questions

## Connections and auth

This package declares a no-auth `agent-browser` custom-tool connection so installers know the agent drives the browser through the framework's native sandbox. There is no external service connection and no required environment variables.

Users provide marketing URLs and product sources of truth in the prompt or in local env/config notes. For authenticated pages, wire access in your application and document the allowed access policy locally.

## Limitations

- The agent is read-only. It never edits, publishes, or ships copy; suggested repairs are drafts for a human to review and apply.
- A claim is only as verifiable as the product sources of truth you provide. Claims it cannot verify are marked unverified rather than confirmed.
- The MVP only compares against files available in `reports/claim-checker/history/...`.
- Local history can be lost when sandboxes are ephemeral. DB-backed history, object storage for screenshots, Slack or email delivery, and external vector/search storage are future work.
- The agent does not discover pages through paid search APIs; it reviews the URLs you configure.
- Screenshots and dynamic page capture depend on the target framework's native browser capability being available. If browser automation is blocked, the agent reports the blocker instead of substituting a static-only audit.
