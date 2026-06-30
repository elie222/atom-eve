#!/usr/bin/env bash
set -euo pipefail
if [ "$#" -ne 1 ]; then
  echo "usage: engagement.sh <customer_id>" >&2
  exit 2
fi

cat <<SQL
SELECT event, timestamp
FROM events
WHERE properties.\$customer_id = '$1'
ORDER BY timestamp DESC
LIMIT 50
SQL
