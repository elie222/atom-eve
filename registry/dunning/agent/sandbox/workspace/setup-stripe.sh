#!/usr/bin/env bash
set -euo pipefail

if command -v stripe >/dev/null 2>&1; then
  exit 0
fi

STRIPE_VERSION="1.30.0"
ARCH="$(uname -m)"
case "$ARCH" in
  x86_64) STRIPE_ARCH="linux_x86_64" ;;
  aarch64 | arm64) STRIPE_ARCH="linux_arm64" ;;
  *) echo "unsupported arch for stripe CLI: $ARCH" >&2; exit 1 ;;
esac

curl -fsSL \
  "https://github.com/stripe/stripe-cli/releases/download/v${STRIPE_VERSION}/stripe_${STRIPE_VERSION}_${STRIPE_ARCH}.tar.gz" \
  -o /tmp/stripe.tar.gz
tar -xzf /tmp/stripe.tar.gz -C /usr/local/bin stripe
rm -f /tmp/stripe.tar.gz

stripe version || true
