# Threat Model — PR-A Scaffold

## Scope

This threat model covers the L0 source-control substrate boundary for org/node Gitea deployment and the planned SocioProphet token-enforcement gateway. PR-A is documentation, schemas, examples, and validation only. Runtime token issuance and live Gitea mutation are out of scope.

## Assets

- Source repositories and branch refs.
- Native Gitea internal service token material.
- SocioProphet scoped tokens.
- Agent identity/cache projections.
- Intent registrations and approvals.
- Audit chain rows and receipt export batches.
- Policy and grant decision references.
- Node trust roots and cross-node bindings.

## Actors

- Human approver.
- Registered external agent.
- Gitea-native automation.
- Mesh node.
- Gateway service account.
- Malicious or compromised agent.
- Network peer attempting direct Gitea bypass.
- Insider with access to local bootstrap material.

## Primary trust boundaries

1. Agent to SP gateway.
2. SP gateway to native Gitea API.
3. SP gateway to policy-fabric.
4. SP gateway to mcp-a2a-zero-trust.
5. Local audit chain to model-governance-ledger export.
6. Node Gitea instance to org Gitea instance.

## Abuse cases

| Abuse case | Required control |
|---|---|
| Token replay | single-use nonce store; `replay.detected` event; revoke session |
| Scope widening | signed canonical token payload; fail-closed schema; gateway scope comparison |
| Intent mutation after approval | RFC 8785 canonical intent hash; post-execution divergence check |
| Branch moved after approval | immediate pre-write `base_ref` and `expected_head` re-check |
| Direct Gitea bypass | internal-only Gitea binding; disable agent SSH/smart-HTTP until enforced |
| Path traversal | normalized path policy; deny wins; reject `..`, symlink, encoded bypass, and confusable bypass |
| Audit truncation | chained hashes; monotonic sequence; export batch hashes |
| Policy/grant service outage | fail closed for write operations |
| Native token exfiltration | never persist raw Gitea tokens; audit only hashes/receipts |
| Cross-node split brain | node id, issuer, grant ref, and receipt export reconciliation |

## Residual risks

- Git packfile/ref validation is not implemented in PR-A.
- Native Gitea permission semantics may not match SocioProphet scopes without gateway mediation.
- HS256 bootstrap mode creates shared-secret blast radius until Ed25519 or HSM-backed signing lands.
- Local SQLite audit is not sufficient as final evidence authority without model-governance-ledger export.

## PR-A acceptance posture

PR-A is acceptable only if it remains non-mutating and validates the intended scaffold. Runtime work must land behind later PRs with explicit gateway, key, audit, and transport tests.
