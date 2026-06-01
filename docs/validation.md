# Validation

## PR-A Scaffold Validation

The PR-A/L0 scaffold uses one canonical validation target.

Run from the repository root:

    make validate

The target currently runs:

1. `node tools/validate-schemas.js`
2. `python3 tools/validate_examples.py`
3. `npm run check`
4. `bash scripts/smoke-test.sh`

The example validator intentionally does not implement full JSON Schema validation. It enforces the current scaffold invariant:

1. Write capabilities must require provider receipts and reconciliation.
2. PR-A write capabilities must be single-use.
3. A `ProviderReceipt` alone is not task completion proof.
4. A `ReconciliationResult` with verified classification is the completion gate.
5. The false-completion negative fixture must remain blocked when reconciliation is missing.

## Current Fixtures

Positive fixtures:

1. `examples/valid-capability-grant.json`
2. `examples/valid-provider-receipt.json`
3. `examples/valid-reconciliation-result.json`

Negative fixtures:

1. `examples/invalid-capability-missing-reconciliation.json`
2. `examples/invalid-capability-multi-use-write.json`
3. `examples/invalid-false-completion-missing-reconciliation.json`

## Acceptance Rule

`make validate` must pass before runtime token issuance or live Gitea mutation can be introduced. Future PRs may replace the custom example validator with a full JSON Schema test harness, but they must preserve the capability, receipt, reconciliation, and false-completion invariants.
