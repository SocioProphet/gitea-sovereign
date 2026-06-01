# Validation

## PR-A Scaffold Validation

The PR-A/L0 scaffold includes a small standard-library validator for the current receipt and reconciliation examples.

Run from the repository root:

    python3 tools/validate_examples.py

The validator intentionally does not implement full JSON Schema validation. It enforces the current scaffold invariant:

1. A `ProviderReceipt` alone is not task completion proof.
2. A `ReconciliationResult` with verified classification is the completion gate.
3. The false-completion negative fixture must remain blocked when reconciliation is missing.

## Current Fixtures

Positive fixtures:

1. `examples/valid-provider-receipt.json`
2. `examples/valid-reconciliation-result.json`

Negative fixture:

1. `examples/invalid-false-completion-missing-reconciliation.json`

## Acceptance Rule

The validator must pass before runtime token issuance or live Gitea mutation can be introduced. Future PRs should extend this validator or replace it with a full JSON Schema test harness, but they must preserve the completion-proof invariant.
