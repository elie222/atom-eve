---
description: Use when you need to drive Agent Browser for web QA, including opening pages, taking snapshots, clicking, filling forms, waiting, and capturing screenshots.
---

# Agent Browser

Use the sandbox `bash` tool to run the `agent-browser` CLI. The normal loop is:

1. Open the target URL.
2. Snapshot interactive elements with refs.
3. Act on refs.
4. Wait for navigation or state changes.
5. Re-snapshot before using new refs.
6. Capture screenshots for important states.

Element refs expire after navigation and meaningful DOM changes, so never reuse old refs after a click, submit, route change, or reload.

## Core Commands

```bash
npx agent-browser --session website-qa open https://example.com
npx agent-browser --session website-qa wait --load networkidle
npx agent-browser --session website-qa snapshot -i
npx agent-browser --session website-qa click @e1
npx agent-browser --session website-qa fill @e2 "test@example.com"
npx agent-browser --session website-qa press Enter
npx agent-browser --session website-qa get url
npx agent-browser --session website-qa get title
npx agent-browser --session website-qa screenshot reports/assets/current.png
npx agent-browser --session website-qa close
```

Use `snapshot -i -C` when clickable custom elements are missing from the normal interactive snapshot.

## QA Workflow

Start each run by opening the requested page and waiting for the page to settle:

```bash
npx agent-browser --session website-qa open "$TARGET_URL"
npx agent-browser --session website-qa wait --load networkidle
npx agent-browser --session website-qa snapshot -i
```

Use the snapshot output to choose the next action. For forms, fill fields with clearly fake data unless the prompt provides approved test credentials. Do not submit payment, bypass CAPTCHA, or use real credentials.

After each action that can change page state:

```bash
npx agent-browser --session website-qa wait --load networkidle
npx agent-browser --session website-qa snapshot -i
```

Save screenshots under `reports/assets/` with descriptive names:

```bash
npx agent-browser --session website-qa screenshot reports/assets/signup-form.png
```

If browser automation is unavailable, blocked, or cannot reach the requested flow, stop and report the blocker. Do not replace browser QA with a static HTML, SEO, or metadata audit.
