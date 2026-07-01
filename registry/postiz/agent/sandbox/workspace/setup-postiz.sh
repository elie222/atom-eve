#!/usr/bin/env bash
set -euo pipefail

if ! command -v postiz >/dev/null 2>&1; then
  npm install -g postiz >/dev/null 2>&1
fi

postiz --version || true
