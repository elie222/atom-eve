# Website QA Agent

## What it does

The Website QA Agent tests a website or web app like a product-minded QA engineer. It is designed for teams that want an agent to open the site, follow a real user flow such as signup or onboarding, capture evidence, and produce a repeatable Markdown report.

This is not an SEO or static HTML audit agent. Use it for browser-driven product QA.

The package includes:

- Framework-native sandbox instructions for running Agent Browser.
- Eve sandbox bootstrap for installing Agent Browser in the Eve sandbox.
- Root-agent instructions you should customize with your own onboarding flow, test credential policy, and acceptance criteria.

The Eve target installs this as a root agent under `agent/` and uses Eve's built-in `bash` tool to run Agent Browser in the sandbox. The Flue target uses Flue's built-in sandbox command capability.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add website-qa --target flue
```

or:

```bash
npx atom-eve add website-qa --target eve
```

## Setup

For Eve, no custom tool dependency is required. The installed sandbox bootstrap prepares Agent Browser inside the Eve sandbox. The first browser run may spend extra time while the sandbox template is built.

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

Then redeploy the project. For Cloudflare or another isolated Flue sandbox, install Agent Browser as part of that sandbox's setup/lifecycle rather than through an application tool.

If Agent Browser is unavailable, the agent should report that the QA run is blocked. It should not silently replace the run with a static HTML audit.

No credentials are required for public websites. For private apps, configure your own Agent Browser profile/session outside this package and document that flow in your local copy.

## Usage

After installing, customize the agent instructions in your project.

For Flue:

```text
src/agents/website-qa.ts
```

For Eve:

```text
agent/instructions.md
```

Example prompt to send to the agent:

```text
Test https://example.com.

Goal: sign up as a new user and reach the first onboarding screen.

Use these test details:
- name: Example QA
- email: <test email>
- password: <test password>

Start from the public homepage, follow the natural signup path, capture screenshots for each important state, and summarize the result.
```

The agent should use built-in sandbox command calls with Agent Browser:

```bash
npx agent-browser --session-name website-qa open https://example.com
npx agent-browser --session-name website-qa wait 2000
npx agent-browser --session-name website-qa snapshot -i
```

Return a concise Markdown report in the agent response. If your app needs persisted QA history, add a local storage tool or wire the response to your own Slack, GitHub, database, or artifact storage workflow.

## Updating An Installed Copy

Today you can rerun the add command from your app repo and review the git diff:

```bash
npx atom-eve add website-qa --target eve
git diff
```

Treat the installed files like shadcn components: update from the registry, inspect the diff, keep local product-specific changes you still need, and commit only what you want. A dedicated `atom-eve update` command should make this workflow nicer over time.

## Connections and auth

This package uses browser automation through the `agent-browser` CLI in the framework sandbox. There is no auth by default.

For authenticated sites, create a browser session/profile manually and adapt the installed tool to pass the relevant Agent Browser flags. Do not commit session state or credentials.

## Limitations

- Browser automation depends on `agent-browser` being available in the runtime environment or Eve sandbox.
- Screenshots and reports are local artifacts; wire them to your own storage if you need long-term history.
- Keep site-specific URLs, credentials, and QA policies in your app repo, not in the registry package.
