# Registered Agent Validation Matrix

## Status

This matrix maps registered-agent failure classes to the current PR-A/L0 validation surface in `gitea-sovereign`.

The purpose is to make the control posture auditable: each material failure mode should be backed by at least one schema, fixture, validator, smoke-test requirement, CI path, or explicit backlog item.

PR-A remains non-mutating. Runtime token issuance, live Gitea mutation, cross-node federation, direct model-to-forge writes, and automatic merge/close/branch-delete/release actions remain blocked until the validation surface proves safe success and unsafe rejection paths.

## Validation Layers

| Layer | File / command | Role |
|---|---|---|
| Canonical command | `make validate` | Runs schema validation, example invariant validation, Node tests, and smoke tests. |
| CI workflow | `.github/workflows/validate.yml` | Runs `make validate` with Node 20 and Python 3.x. |
| Node scaffold validator | `tools/validate-schemas.js` | Requires core scaffold files, registered-agent schemas, fixtures, docs, and scaffold invariants. |
| Python invariant validator | `tools/validate_examples.py` | Enforces capability, receipt, reconciliation, and false-completion invariants. |
| Smoke test | `scripts/smoke-test.sh` | Requires core scaffold and registered-agent validation artifacts to be present. |
| Test suite | `npm run check` | Preserves disabled runtime posture, local-only boundaries, audit/export behavior, and fail-closed contracts. |

## Core Artifacts

| Artifact | Purpose |
|---|---|
| `schemas/capability-grant.schema.json` | Defines task-scoped, expiring, least-privilege capabilities. Requires receipt and reconciliation. |
| `schemas/provider-receipt.schema.json` | Defines provider operation receipt. Receipt is Tier 3 evidence, not completion proof. |
| `schemas/reconciliation-result.schema.json` | Defines post-action source-of-truth reconciliation result. This is the completion gate. |
| `examples/valid-capability-grant.json` | Positive capability fixture for a clean PR merge. |
| `examples/valid-provider-receipt.json` | Positive provider receipt fixture linked to the capability. |
| `examples/valid-reconciliation-result.json` | Positive reconciliation fixture proving verified success. |
| `examples/invalid-capability-missing-reconciliation.json` | Negative fixture for write capability without reconciliation requirement. |
| `examples/invalid-capability-multi-use-write.json` | Negative fixture for multi-use write capability. |
| `examples/invalid-false-completion-missing-reconciliation.json` | Negative fixture for provider receipt without reconciliation. |
| `docs/registered-agent-control-plane-integration.md` | Defines ecosystem authority boundaries and evidence path. |
| `docs/threat-model.md` | Defines failure classes, trust boundaries, controls, and validation requirements. |
| `docs/validation.md` | Documents `make validate`, invariants, and fixture set. |

## Failure-Class Coverage

| ID | Failure class | Current control | Validation coverage | Status |
|---|---|---|---|---|
| FC-001 | Agent false-completion claim | Completion requires `ReconciliationResult`; receipt alone is insufficient. | Negative fixture `invalid-false-completion-missing-reconciliation`; Python validator; validation doc. | Covered |
| FC-002 | Stale-state mutation | Capability freshness window and expected head/base fields. | Capability schema and valid fixture include `freshness_seconds`, `expected_head`, and `expected_base`. | Partially covered; needs stale-state negative fixture. |
| FC-003 | Token/capability replay | Single-use write capability and replay-oriented local grant tests. | Capability schema/fixture; Python validator rejects multi-use write; local grant nonce replay tests. | Covered for PR-A local scaffold. |
| FC-004 | Scope widening | Capability binds agent, task, operation, repository, object type, object id, grant ref, and policy ref. | Capability schema; provider receipt must match capability fields in Python validator. | Covered |
| FC-005 | Intent mutation after approval | Intent hash and operation order exist in existing scaffold. | Intent schema/example and Node validator check operation ordering. | Covered at scaffold level |
| FC-006 | Branch moved after approval | Capability supports `expected_head` and `expected_base`. | Capability schema and valid fixture. | Partially covered; needs moved-head registered-agent negative fixture. |
| FC-007 | Direct Gitea bypass | Runtime writes remain disabled; native Gitea ports and SSH are disabled. | Compose tests; transport docs; smoke test; Node validator. | Covered for PR-A |
| FC-008 | Path traversal / confusable bypass | Normalize and reject traversal/encoded path bypasses. | Control-boundary tests and path-boundary docs. | Covered |
| FC-009 | Audit truncation | Audit chain with hash chaining and export checks. | Audit-chain tests, receipt-export tests, ledger export binding tests. | Covered at scaffold level |
| FC-010 | Policy/grant service outage | Fail-closed dependency behavior. | Upstream reference binding fixture/tests; threat model. | Covered at scaffold level |
| FC-011 | Native token exfiltration | Native material is digested/redacted; raw token field names forbidden. | Native adapter tests; Node validator checks native adapter. | Covered |
| FC-012 | Cross-node split brain | Federation remains out of scope; divergence modeled in threat model and reconciliation enum. | Threat model; reconciliation schema includes `divergent_state`. | Partially covered; runtime/federation tests later. |
| FC-013 | Wrong repository or branch mutation | Capability and receipt target binding. | Capability schema; provider receipt schema; Python validator checks receipt-to-capability field equality. | Covered for fixture path |
| FC-014 | Unsafe branch deletion | Destructive action disabled in PR-A example; branch delete is modeled as write op. | Capability schema has `allow_destructive_action`; Python validator rejects destructive action in PR-A example. | Partially covered; needs branch-delete negative fixture. |
| FC-015 | Unauthorized PR closure | Close is modeled as separate operation from merge. | Capability schema operation enum; Python write-operation set. | Partially covered; needs close-with-merge-capability negative fixture. |
| FC-016 | Merge with failing checks/review blockers | Capability supports required checks and review clearance. | Capability schema and valid fixture require checks/reviews. | Partially covered; needs failing-check negative fixture. |
| FC-017 | Webhook replay or forged event | Event replay modeled in existing attack fixtures and threat model. | Existing replay attack fixture; threat model. | Covered at scaffold level |
| FC-018 | Compromised runner | Runtime promotion remains blocked; evidence and checks modeled. | Threat model and validation docs. | Backlog |
| FC-019 | Forge database tampering | External ledger export and reconciliation are required. | Receipt-export tests; reconciliation schema; ledger export tests. | Covered at scaffold level |
| FC-020 | Memory treated as operational truth | Completion derives from fixtures/receipts/reconciliation, not narrative. | Python negative false-completion case; docs. | Covered |
| FC-021 | Retry loop after failure | Retry-loop failure modeled in threat model and failure event taxonomy. | Threat model. | Backlog |
| FC-022 | Ambiguous mutation state | Reconciliation enum includes `ambiguous_mutation_state`; provider receipt has ambiguous execution result. | Schemas and Node validator check reconciliation enum. | Partially covered; needs ambiguous mutation fixture. |
| FC-023 | Protected governance mutation | Protected paths documented; autonomous runtime mutation blocked. | Threat model, docs, validation artifacts. | Partially covered; needs protected-path negative fixture. |

## Coverage Gaps

The next fixture/test tranche should add negative cases for:

1. Stale-state mutation after capability issuance.
2. Branch moved after approval.
3. Unsafe branch delete.
4. Close-with-merge-capability mismatch.
5. Merge with failing checks.
6. Ambiguous mutation state.
7. Protected governance path mutation.
8. Retry loop after repeated invalid capability/tool failure.

## Acceptance Rule

The current PR-A/L0 registered-agent validation surface is acceptable only for non-mutating scaffold work.

Before runtime token issuance or live Gitea mutation lands, this matrix must show covered validation for every write-class failure mode, and `make validate` must pass in CI.
