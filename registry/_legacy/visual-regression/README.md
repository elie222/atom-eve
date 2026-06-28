# Visual Regression Agent

## What it does

The Visual Regression Agent opens this project's key screens in a real browser, captures screenshots, and flags unintended UI differences against a saved baseline. It runs on a weekly schedule by default and is designed for teams that want an automated, repeatable check for visual regressions.

This is a read-only review agent. It captures current screenshots, compares them to the baseline, and reports diffs ordered by severity. It never approves, updates, or overwrites baselines, and it never changes the product UI.

This is not an SEO or static HTML audit agent. Use it for browser-driven visual diffing.

The package includes:

- Framework-native sandbox instructions for running Agent Browser.
- Eve sandbox bootstrap that installs Agent Browser and creates the baseline/current/diffs report directories.
- A weekly schedule (Eve) and matching workflow (Flue) that share one trigger prompt.
- Root-agent instructions you should customize with your own screen list, target URLs, and capture settings.

The Eve target installs this as a root agent under `agent/` and uses Eve's built-in `bash` tool to run Agent Browser in the sandbox. The Flue target uses Flue's built-in sandbox command capability.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add visual-regression --target flue
```

or:

```bash
npx atom-eve add visual-regression --target eve
```

## Setup

For Eve, no custom tool dependency is required. The installed sandbox bootstrap prepares Agent Browser inside the Eve sandbox and creates `reports/visual-regression/{baseline,current,diffs}`. The first browser run may spend extra time while the sandbox template is built.

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

Establish a baseline once for the screens you care about by saving approved screenshots under `reports/visual-regression/baseline`. After install, customize the screen list, target URLs, and capture settings in your local copy of the agent instructions.

## Usage

The agent runs weekly by default (`0 9 * * 1`). The Eve schedule and the Flue workflow both trigger the same shared prompt, so the timing and behavior stay in sync.

You can also run it on demand. Example prompt:

```text
Run a visual regression check on https://example.com.

Capture the homepage and the pricing page, compare against reports/visual-regression/baseline,
and report any unintended UI diffs. Do not update the baseline or change any UI.
```

The agent should use built-in sandbox command calls with Agent Browser:

```bash
bash setup-agent-browser.sh
npx agent-browser --session visual-regression open https://example.com
npx agent-browser --session visual-regression wait 2000
npx agent-browser --session visual-regression screenshot reports/visual-regression/current/home.png
```

Return a concise Markdown report in the agent response. If your app needs persisted regression history, wire the response and artifacts to your own Slack, GitHub, database, or artifact storage workflow.

## Connections and auth

This package uses browser automation through the `agent-browser` CLI in the framework sandbox. There is no auth by default and no required environment variables.

For authenticated sites, create a browser session/profile manually and adapt the installed instructions to pass the relevant Agent Browser flags. Do not commit session state or credentials.

## Limitations

- Browser automation depends on `agent-browser` being available in the runtime environment or Eve sandbox. If it is unavailable the agent reports the blocker rather than running a static HTML or SEO audit.
- This agent is read-only: it never approves or updates baselines and never changes UI. Promote a new baseline yourself when a change is intentional.
- Screenshots, baselines, and reports are local artifacts; wire them to your own storage if you need long-term history.
- Visual diffing quality depends on deterministic capture settings (fixed viewport, stable waits, blocked animations). Keep screen-specific URLs and capture policies in your app repo, not in the registry package.
