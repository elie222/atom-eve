#!/usr/bin/env bash
set -euo pipefail

if [ -f .agent-browser-ready ]; then
  exit 0
fi

mkdir -p reports/ux-reviewer/assets
npm init -y >/dev/null
npm install agent-browser@latest playwright@latest

case "$(uname -m)" in
  aarch64|arm64)
    npx playwright install --with-deps chromium
    CHROMIUM_PATH="$(node -e "const { chromium } = require('playwright'); console.log(chromium.executablePath())")"
    printf '{"executablePath":"%s","args":"--no-sandbox"}\n' "$CHROMIUM_PATH" > agent-browser.json
    ;;
  *)
    npx agent-browser install --with-deps
    ;;
esac

touch .agent-browser-ready
