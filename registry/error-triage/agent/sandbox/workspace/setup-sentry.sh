#!/usr/bin/env bash
set -euo pipefail

if command -v sentry >/dev/null 2>&1; then
  exit 0
fi

mkdir -p "$HOME/.local/bin"
curl -fsSL https://cli.sentry.dev/install -o /tmp/sentry-install.sh
SENTRY_INSTALL_DIR="$HOME/.local/bin" SENTRY_VERSION="0.19.0" bash /tmp/sentry-install.sh
rm -f /tmp/sentry-install.sh

export PATH="$HOME/.local/bin:$PATH"
if ! grep -qs '.local/bin' "$HOME/.profile" 2>/dev/null; then
  printf '\nexport PATH="$HOME/.local/bin:$PATH"\n' >> "$HOME/.profile"
fi

if ! command -v sentry >/dev/null 2>&1; then
  echo "sentry installed but not found on PATH; expected $HOME/.local/bin/sentry" >&2
  exit 1
fi
