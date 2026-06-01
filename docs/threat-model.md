# Sovereign Forge Threat Model — PR-A / L0 Scaffold

## Scope

This threat model covers the L0 source-control substrate boundary for org/node Gitea deployment and the planned SocioProphet token-enforcement gateway.

PR-A remains documentation, schemas, examples, and validation only. Runtime token issuance, live Gitea mutation by registered agents, cross-node federation, direct model-to-forge writes, and automatic merge/close/branch-delete/release actions are out of scope until capability, policy, receipt, reconciliation, and validation controls exist.

This model covers both hostile actors and incompetent or drifting registered agents. A non-malicious registered agent can still cause harm by acting on stale state, overclaiming completion, retrying invalid mutations, or using overbroad credentials outside a task-scoped capability envelope.

## Security Objective

`gitea-sovereign` must make local sovereign source-control mutation safe for registered agents without trusting agent narrative, memory, or discretion as authority.

```text
No registered agent can mutate sovereign source-control state unless the action is authorized by a narrow capability, permitted by policy, executed through a mediated forge adapter, captured as a receipt, exported into the governance/evidence fabric, and reconciled against source-of-truth forge state.
```

## Ecosystem Authority Boundary

`gitea-sovereign` is the local-only L0 source-control substrate, Gitea substrate boundary, token gateway boundary, intent/audit projection source, and receipt-export producer.

It does not replace the broader control-plane authorities:

```text
Sociosphere
  = canonical workspace and governance controller
  = repository estate controller
  = governance graph / active-spine authority

Prophet Platform
  = runtime and deployment hub
  = orchestration, receipt workflow, dashboarding, promotion workflow

AgentPlane
  = execution/evidence bridge between decisions and side-effecting tools

PolicyPlane / policy-fabric
  = authorization and side-effect boundary control

Ontogenesis
  = ontology, schema semantics, SHACL-style meaning layer, promotion semantics

TriTRPC
  = typed transport and RPC contract lane

mcp-a2a-zero-trust
  = grant decision endpoint and zero-trust agent interoperability boundary

model-governance-ledger
  = receipt export sink and model/action governance audit lane
```

Expected evidence path:

```text
gitea-sovereign receipt
  -> receipt-export-cursor
  -> Sociosphere governance graph
  -> SVF receipt reference
  -> Prophet Platform runtime / promotion workflow
  -> AgentPlane evidence bridge
  -> PolicyPlane authorization trail
  -> Ontogenesis semantic validation
  -> model-governance-ledger audit sink
```

Local Gitea state is a source of local forge facts. It is not by itself the final authority for governance completion or promotion.

## Assets

Primary assets:

```text
source repositories
branches
refs
commits
pull requests
issues
labels
release artifacts
native Gitea internal service token material
SocioProphet scoped tokens
agent identity/cache projections
intent registrations and approvals
audit chain rows
receipt export batches
policy and grant decision references
node trust roots
cross-node bindings
forge configuration
repository settings
CODEOWNERS and review policy
CI and validation status
webhook events
capability grants
provider tokens
mutation receipts
reconciliation results
governance graph projections
```

High-value derived assets:

```text
canonical queue snapshots
merge decisions
branch deletion decisions
agent reliability scores
policy decisions
federation state digests
cross-node replication logs
receipt-export cursors
SVF receipt references
```

## Actors

```text
Human approver
Registered external agent
Gitea-native automation
Mesh node
Gateway service account
Capability broker
PolicyPlane / policy-fabric evaluator
mcp-a2a-zero-trust grant decision service
AgentPlane execution/evidence bridge
Sociosphere governance controller
Prophet Platform runtime/promoter
Ontogenesis semantic validator
model-governance-ledger export sink
Malicious or compromised agent
Network peer attempting direct Gitea bypass
Insider with access to local bootstrap material
Compromised self-hosted runner
Compromised Gitea administrator
Federation peer, future scope
```

## Primary Trust Boundaries

```text
human instruction -> task contract
conversation memory -> operational state
agent reasoning -> capability request
capability request -> mcp-a2a-zero-trust grant decision
capability request -> capability grant
capability grant -> policy-fabric decision
policy decision -> SP gateway
SP gateway -> native Gitea API
SP gateway -> AgentPlane evidence bridge
forge adapter execution -> provider receipt
provider receipt -> reconciliation result
local audit chain -> receipt-export cursor
receipt-export cursor -> model-governance-ledger
receipt-export cursor -> Sociosphere governance graph
Sociosphere governance graph -> Prophet Platform promotion workflow
Ontogenesis schema validation -> promotion semantics
node Gitea instance -> org Gitea instance
local forge node -> federation peer, future scope
CI result -> merge authorization
```

The most important boundary is between agent narrative and operational truth. The platform must never treat chat output as proof that a source-control operation occurred.

## Evidence Tiers

```text
Tier 0: agent narrative
Tier 1: tool call attempted
Tier 2: tool call succeeded
Tier 3: provider receipt captured
Tier 4: post-action source-of-truth reconciliation
Tier 5: independent replay, SVF receipt reference, or second verifier confirms
```

Task completion requires Tier 4 or Tier 5 evidence. Promotion requires export into the governance/evidence fabric.

## Abuse and Failure Cases

| ID | Abuse / failure case | Required control | Ecosystem mapping | Validation case |
|---|---|---|---|---|
| FC-001 | False completion claim | completion gate requires reconciliation result; reports derive from ledger, not chat | Sociosphere governance graph; SVF receipt refs; model-governance-ledger | agent emits success without receipt; task remains incomplete |
| FC-002 | Stale-state mutation | freshness requirement; pre-write source-of-truth re-read; expected head binding | PolicyPlane; AgentPlane evidence | change PR head after capability issuance; merge rejected |
| FC-003 | Token replay | single-use nonce store; `replay.detected`; consumed capability tombstone | mcp-a2a-zero-trust; policy-fabric | reuse consumed capability; reject and emit replay event |
| FC-004 | Scope widening | signed canonical token payload; fail-closed schema; gateway scope comparison | mcp-a2a-zero-trust; Ontogenesis schema validation | use PR-scoped grant against another PR; reject |
| FC-005 | Intent mutation after approval | RFC 8785 canonical intent hash; post-execution divergence check | AgentPlane; PolicyPlane | mutate intent after approval; execution rejected |
| FC-006 | Branch moved after approval | immediate pre-write `base_ref` and `expected_head` re-check | PolicyPlane; Gitea adapter | move branch after approval; write rejected |
| FC-007 | Direct Gitea bypass | internal-only Gitea binding; disable agent SSH/smart-HTTP until enforced | SP gateway; source-control substrate | attempt direct agent mutation path; deny |
| FC-008 | Path traversal / confusable bypass | normalized path policy; deny wins; reject `..`, symlink, encoded, and confusable bypasses | PolicyPlane; Ontogenesis schema semantics | submit bypass path; deny |
| FC-009 | Audit truncation | chained hashes; monotonic sequence; export batch hashes | model-governance-ledger; Sociosphere | truncate local audit chain; export reconciliation detects gap |
| FC-010 | Policy/grant service outage | fail closed for write operations | PolicyPlane; mcp-a2a-zero-trust | simulate grant endpoint outage; write denied |
| FC-011 | Native token exfiltration | never expose raw Gitea tokens to model; broker-held provider credentials; audit only hashes/receipts | SP gateway; model-governance-ledger | scan agent payloads; no raw token present |
| FC-012 | Cross-node split brain | node id, issuer, grant ref, receipt export reconciliation | federation future scope; Sociosphere | conflicting node state enters divergent/quarantine state |
| FC-013 | Wrong repository or branch mutation | target-bound capability; adapter-level target verification; receipt target digest | PolicyPlane; AgentPlane | mismatched repo/branch mutation rejected |
| FC-014 | Unsafe branch deletion | delete requires merged proof or explicit approval; base contains merge/head proof | Sociosphere queue; PolicyPlane | unmerged branch delete rejected |
| FC-015 | Unauthorized PR closure | close operation separate from merge; requires reason code and explicit scope | Sociosphere queue; governance graph | merge-only capability attempts close; rejected |
| FC-016 | Merge with failing checks/review blockers | required checks; review-state policy; protected path policy | PolicyPlane; Prophet promotion workflow | failing check PR merge rejected |
| FC-017 | Webhook replay or forged event | signature validation; event id dedupe; timestamp window; payload digest | AgentPlane; model-governance-ledger | replay old webhook; ignored for completion |
| FC-018 | Compromised runner | runner identity binding; check provenance; artifact digest; second verifier for protected paths | SVF; Prophet Platform | unauthorized runner check rejected as merge authority |
| FC-019 | Forge database tampering | external append-only receipt ledger; state digest snapshots; periodic reconciliation | model-governance-ledger; Sociosphere | alter forge state after receipt; drift detected |
| FC-020 | Memory treated as operational truth | memory low-trust; write preflight must read live forge state | Sociosphere source-of-truth query | prior count claim ignored; queue recomputed |
| FC-021 | Retry loop after failure | failure-class-aware retry policy; permission denial terminal; ambiguous mutation triggers reconciliation | Agent reliability scoring; AgentPlane | repeated invalid write blocked and reliability degraded |
| FC-022 | Ambiguous mutation state | ambiguous terminal state; immediate reconciliation; no retry until reconciled | AgentPlane; Sociosphere ledger | simulate timeout after possible mutation; reconcile before retry |
| FC-023 | Protected governance mutation | protected path list; owner review; two-person or independent verifier | PolicyPlane; Ontogenesis; Sociosphere | PR touches schemas/policy; autonomous merge denied |

## Protected Paths

Initial protected path candidates:

```text
.github/workflows/**
.github/actions/**
infra/**
terraform/**
secrets/**
auth/**
policy/**
policies/**
agent-registry/**
capabilities/**
schemas/**
docs/threat-model.md
docs/registered-agent-control-plane-integration.md
CODEOWNERS
```

Protected paths may be read by registered agents. Autonomous mutation or merge requires elevated review.

## Mandatory L0 Controls

```text
capability-scoped writes
fresh source-of-truth preflight
policy decision before execution
mcp-a2a-zero-trust grant decision before capability issuance
mediated SP gateway / forge adapter only
provider receipt capture
post-action reconciliation
append-only local audit chain
receipt-export cursor into model-governance-ledger
SVF receipt-reference mapping into Sociosphere
failure event emission
agent reliability scoring
quarantine on repeated unsafe behavior
fail-closed writes during policy/grant outage
```

## Failure Event Taxonomy

```text
tool.schema_error
tool.permission_denied
tool.rate_limited
tool.provider_unavailable
tool.execution_failed
tool.ambiguous_mutation_state
policy.capability_mismatch
policy.expired_capability
policy.stale_state
policy.protected_path
policy.failed_checks
policy.review_blocker
policy.unauthorized_close
policy.unsafe_branch_delete
reconciliation.failed
reconciliation.divergent_state
grant.replay_detected
grant.scope_widening_detected
audit.truncation_detected
agent.false_completion_claim
agent.retry_loop
agent.memory_as_truth
```

## Required Receipt Fields

Each mutation receipt must include:

```text
receipt_id
agent_id
task_id
capability_id
grant_decision_ref
policy_decision_ref
operation
repository
object_type
object_id
before_state_digest
preflight_policy_decision
execution_result
provider_request_id
provider_object_version
commit_sha_or_merge_sha_or_state_marker
after_state_digest
reconciliation_result_id
svf_receipt_ref
receipt_export_cursor
timestamp
```

## Required Reconciliation Fields

Each reconciliation result must include:

```text
reconciliation_result_id
receipt_id
repository
object_type
object_id
expected_state
observed_state
source_of_truth_read_timestamp
source_of_truth_object_version
classification
reason
```

Allowed classifications:

```text
verified_success
verified_noop
verified_rejected
reconciliation_failed
ambiguous_mutation_state
divergent_state
requires_human_review
```

## Validation Harness Requirements

The validation harness must create a local ephemeral Gitea instance and seed:

```text
one repository
one default branch
one clean feature branch
one pull request with passing checks
one pull request with failing checks
one pull request touching protected paths
one branch with unmerged commits
one issue
one webhook signing secret
one low-privilege provider token
one simulated broker-held credential
one mock policy-fabric endpoint
one mock mcp-a2a-zero-trust grant endpoint
one mock receipt-export sink
```

The harness must prove:

```text
safe reads work
clean merge succeeds only with valid capability
merge with failing checks is rejected
protected-path merge is rejected
stale-state merge is rejected
expired capability is rejected
capability replay is rejected
wrong-target capability is rejected
unsafe branch deletion is rejected
unauthorized close is rejected
ambiguous mutation state triggers reconciliation
no task completes from agent narrative alone
receipt is emitted for execution
reconciliation is emitted for completion
receipt export cursor advances only after valid receipt
SVF receipt ref can be produced for governance graph ingestion
policy/grant outage fails closed
```

## Residual Risks

```text
Git packfile/ref validation is not implemented in PR-A.
Native Gitea permission semantics may not match SocioProphet scopes without gateway mediation.
HS256 bootstrap mode creates shared-secret blast radius until Ed25519 or HSM-backed signing lands.
Local SQLite audit is not sufficient as final evidence authority without model-governance-ledger export.
Federation semantics remain future scope and must not be enabled from this scaffold alone.
Agent reliability scoring is specified here but requires implementation in the orchestration/runtime layer.
```

## PR-A Acceptance Posture

PR-A is acceptable only if it remains non-mutating and validates the intended scaffold. Runtime work must land behind later PRs with explicit gateway, key, audit, receipt, reconciliation, policy, and transport tests.

Runtime token issuance and live Gitea mutation remain blocked until the validation harness proves at least one safe success path and multiple unsafe rejection paths.

## Backlog

1. Convert failure classes into machine-readable validation fixtures.
2. Add JSON Schemas for `ProviderReceipt` and `ReconciliationResult`.
3. Add protected-path, capability-mismatch, stale-state, and expired-capability policy fixtures.
4. Add local ephemeral Gitea harness wiring.
5. Add simulated ambiguous mutation tests.
6. Add agent reliability score events for false-completion and retry-loop cases.
7. Add SVF receipt-reference mapping.
8. Add model-governance-ledger receipt-export cursor semantics.
9. Add Ontogenesis semantic validation hooks for gateway, capability, receipt, and reconciliation schemas.
10. Add AgentPlane evidence bridge mapping for side-effecting forge operations.
