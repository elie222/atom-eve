# Website QA Agent

## What it does

The Website QA Agent audits a public website and writes a practical QA report. It is designed for product teams and developers who want an agent to click through a site, inspect the page, capture evidence, and produce a repeatable Markdown report.

The Flue target includes:

- A browser-audit tool that can call the `agent-browser` CLI when it is installed.
- A static HTML/metadata fallback when browser automation is unavailable.
- A report writer that stores Markdown QA reports in the installed project.
- A sample QA brief you should customize for your own product.

## Supported targets

- Flue

## Install

```bash
npx atom-eve add website-qa --target flue
```

## Setup

Install Agent Browser if you want screenshots and interactive browser checks:

```bash
npm install -g agent-browser
agent-browser install
```

The agent still works without Agent Browser, but it will fall back to HTTP/HTML checks and skip screenshots.

No credentials are required for public websites. For private apps, configure your own Agent Browser profile/session outside this package and document that flow in your local copy.

## Usage

After installing, customize the QA brief in your project:

```text
src/skills/website-qa-qa-brief/SKILL.md
```

Example prompt to send to the agent:

```text
Audit https://example.com.

Focus on:
- homepage clarity
- navigation and primary CTAs
- mobile usability
- obvious accessibility issues
- title/meta/heading SEO basics
- broken or confusing interactions

Save the report as reports/example-com-latest.md.
```

The tool writes reports under `reports/` by default and screenshots under `reports/assets/` when Agent Browser is available.

## Connections and auth

This package uses a local browser automation connection through the `agent-browser` CLI. There is no auth by default.

For authenticated sites, create a browser session/profile manually and adapt the installed tool to pass the relevant Agent Browser flags. Do not commit session state or credentials.

## Limitations

- Browser automation depends on `agent-browser` being installed in the runtime environment.
- The fallback HTML audit does not execute JavaScript or inspect post-load UI state.
- Screenshots and reports are local artifacts; wire them to your own storage if you need long-term history.
- Keep site-specific URLs, credentials, and QA policies in your app repo, not in the registry package.
