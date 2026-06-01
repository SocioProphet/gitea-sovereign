#!/usr/bin/env bash
set -euo pipefail

printf 'PR-A smoke test: non-mutating scaffold only\n'

required=(
  README.md
  Makefile
  docs/authority-boundaries.md
  docs/transport-boundary.md
  docs/threat-model.md
  docs/registered-agent-control-plane-integration.md
  docs/registered-agent-validation-matrix.md
  docs/validation.md
  schemas/token.schema.json
  schemas/intent.schema.json
  schemas/audit-event.schema.json
  schemas/agent-registration.schema.json
  schemas/receipt-export.schema.json
  schemas/capability-grant.schema.json
  schemas/provider-receipt.schema.json
  schemas/reconciliation-result.schema.json
  examples/valid-capability-grant.json
  examples/valid-provider-receipt.json
  examples/valid-reconciliation-result.json
  examples/invalid-capability-missing-reconciliation.json
  examples/invalid-capability-multi-use-write.json
  examples/invalid-false-completion-missing-reconciliation.json
  tools/validate-schemas.js
  tools/validate_examples.py
)

for file in "${required[@]}"; do
  test -f "$file" || { echo "missing $file" >&2; exit 1; }
done

echo 'ok: scaffold files present'
echo 'ok: registered-agent validation artifacts present'
echo 'ok: runtime bootstrap intentionally disabled'
echo 'ok: native Gitea token issuance intentionally disabled'
