#!/usr/bin/env bash
set -euo pipefail

printf 'PR-A smoke test: non-mutating scaffold only\n'

required=(
  README.md
  Makefile
  docs/authority-boundaries.md
  docs/transport-boundary.md
  docs/threat-model.md
  schemas/token.schema.json
  schemas/intent.schema.json
  schemas/audit-event.schema.json
  schemas/agent-registration.schema.json
  schemas/receipt-export.schema.json
  tools/validate-schemas.js
)

for file in "${required[@]}"; do
  test -f "$file" || { echo "missing $file" >&2; exit 1; }
done

echo 'ok: scaffold files present'
echo 'ok: runtime bootstrap intentionally disabled'
echo 'ok: native Gitea token issuance intentionally disabled'
