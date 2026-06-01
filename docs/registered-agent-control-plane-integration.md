# Registered Agent Control Plane Integration

## Status

This document defines the initial integration boundary between `gitea-sovereign` and the SocioProphet registered-agent control plane.

`gitea-sovereign` is the L0 sovereign source-control substrate for SocioProphet. It is not a general-purpose chat-agent execution surface. It is the self-hosted forge substrate and Gitea reference lane through which registered agents may eventually read, validate, mutate, and reconcile source-control state under explicit capability, policy, and receipt controls.

## Architectural Role

`gitea-sovereign` owns the sovereign forge boundary for SocioProphet.

The registered-agent control plane should be split as follows:

```text
Sociosphere / Prophet Platform
  = agent registry, task contracts, policy engine, orchestration, reliability scoring

gitea-sovereign
  = sovereign Git forge substrate
  = Gitea adapter reference implementation
  = local/self-hosted source-control mutation harness
  = forge threat model
  = transport and token issuance boundary, once authorized
  = cross-node federation boundary, once authorized

External forge adapters
  = GitHub, Forgejo, GitLab, and other compatibility lanes
```

GitHub is not the normative architecture. GitHub is one external adapter. `gitea-sovereign` is the sovereign substrate that defines the desired control semantics for self-hosted source-control operations.

## Non-Goals for the Initial L0 / PR-A Scope

The following are intentionally out of scope until foundational controls exist:

1. Runtime token issuance.
2. Live Gitea mutation by registered agents.
3. Cross-node federation.
4. Direct model-to-forge write access.
5. Automatic merge, close, branch-delete, or release actions.
6. Trusting agent narrative as proof of task completion.

The initial scope is schema, threat model, transport boundary, validation harness, and receipt/reconciliation semantics.

## Core Control Principle

A registered agent may propose, request, and execute only within a typed, audited, revocable capability envelope. Every consequential source-control action must be reconciled against source-of-truth forge state before it can be recorded as complete.

The agent's chat output is not authoritative. Durable truth must come from typed receipts and post-action reconciliation.

## Forge-Neutral Adapter Boundary

The control plane should depend on a forge-neutral adapter interface, with `gitea-sovereign` supplying the sovereign Gitea implementation.

```typescript
interface ForgeAdapter {
  readRepository(input: RepoRef): Promise<RepositoryState>;
  readPullRequest(input: PullRequestRef): Promise<PullRequestState>;
  readBranch(input: BranchRef): Promise<BranchState>;
  readCommit(input: CommitRef): Promise<CommitState>;
  readChecks(input: CommitRef): Promise<CheckState[]>;

  preflightMutation(input: ForgeMutationIntent): Promise<PolicyFacts>;
  executeMutation(input: AuthorizedForgeMutation): Promise<ProviderReceipt>;
  reconcileMutation(input: ProviderReceipt): Promise<ReconciliationResult>;
}
```

Initial mutation classes:

```text
forge.pull_request.merge
forge.pull_request.close
forge.branch.delete
forge.issue.close
forge.label.apply
forge.comment.create
forge.release.create
```

Initial read classes:

```text
forge.repository.read
forge.pull_request.read
forge.branch.read
forge.commit.read
forge.checks.read
forge.issue.read
forge.diff.read
```

## Required Schemas

The initial schema set should include:

```text
AgentRegistration
CapabilityGrant
TaskContract
ForgeAdapterBinding
ForgeMutationIntent
AuthorizedForgeMutation
ProviderReceipt
ReconciliationResult
TaskStateSnapshot
AgentReliabilityProfile
PolicyDecision
```

Gitea-specific bindings should include:

```text
GiteaRepositoryState
GiteaPullRequestState
GiteaBranchState
GiteaCommitState
GiteaCheckState
GiteaWebhookEvent
GiteaTokenGrant
GiteaMutationReceipt
```

## Capability Mediation Requirements

No registered agent receives broad forge access. The capability broker must issue narrow, expiring, task-scoped capability grants.

A write capability must bind at least:

```text
agent_id
operation
repository
object type
object identifier
allowed branch or pull request number
freshness requirement
maximum uses
expiration
required preflight checks
required receipt class
required reconciliation class
```

A capability for one repository, branch, pull request, or mutation class must not authorize any other target.

## Mutation Lifecycle

Every consequential mutation must use the following lifecycle:

```text
INTENT
  Agent or orchestrator declares the proposed operation.

PREFLIGHT
  Policy engine checks current forge state, task scope, capability, diff, checks, reviews, protected paths, and freshness.

EXECUTION
  Forge adapter performs the operation through a controlled provider boundary.

RECEIPT
  Adapter captures provider response, request identifier where available, target object identifiers, timestamps, before/after facts, and mutation result.

RECONCILIATION
  Adapter re-reads source-of-truth forge state and confirms the claimed effect actually holds.
```

No task may be marked complete before reconciliation.

Allowed terminal states:

```text
verified_success
blocked
failed_preflight
execution_failed
reconciliation_failed
ambiguous_mutation_state
requires_human_review
```

## Receipt Requirements

A mutation receipt must capture:

```text
receipt_id
agent_id
task_id
capability_id
operation
repository
object identifier
before state digest
execution result
provider request id, if available
resulting commit sha, merge sha, issue state, or branch state, as applicable
after state digest
reconciliation result
timestamp
```

Agent narrative is Tier 0 evidence only. Verified completion requires a post-action source-of-truth reconciliation result.

## Threat Model

The initial threat model must cover at least:

1. Agent false-completion claims.
2. Agent stale-state action.
3. Token overbreadth.
4. Capability replay.
5. Wrong repository or wrong branch mutation.
6. Branch deletion before merge confirmation.
7. Pull request closure without policy authorization.
8. Merge despite failing checks or unresolved review state.
9. Protected-path mutation without elevated review.
10. Webhook replay or forged event ingestion.
11. Compromised self-hosted runner.
12. Compromised Gitea administrator token.
13. Forge database tampering.
14. Cross-node federation poisoning.
15. Divergent state across federated forge nodes.
16. Ambiguous mutation state after provider or network failure.
17. Conversation memory being treated as operational truth.
18. Agent retry loops after schema, permission, or provider failure.

## Validation Harness

The validation harness should use a local ephemeral Gitea instance with seeded repositories, branches, issues, pull requests, checks, labels, and webhooks.

Required validation scenarios:

```text
read repository state
read pull request state
read branch state
merge clean pull request
reject merge with failing checks
reject merge touching protected paths
reject stale-state mutation
reject capability target mismatch
reject expired capability
reject branch deletion before merge reconciliation
capture provider receipt
reconcile successful mutation
classify ambiguous mutation state
record failure event without claiming success
```

## Acceptance Criteria

The initial integration is acceptable when:

1. The forge-neutral adapter interface is specified.
2. Gitea-specific state and receipt schemas are specified.
3. The mutation lifecycle is documented.
4. The threat model exists and covers agent competence failure, not only malicious behavior.
5. The validation harness can prove at least one successful mutation and at least five rejected unsafe mutations.
6. No registered agent can mark a mutation complete without a reconciliation result.
7. No direct model-to-Gitea write path exists.
8. All future token issuance work is explicitly downstream of capability, policy, receipt, and reconciliation controls.

## Backlog

1. Add JSON Schemas for the required schema set.
2. Add the Gitea adapter state model.
3. Add the receipt event model.
4. Add the reconciliation result model.
5. Add a local ephemeral Gitea validation harness.
6. Add policy fixtures for clean merge, failed checks, protected path, stale state, expired capability, and target mismatch.
7. Add threat-model tests that force ambiguous mutation state and prove no success claim is emitted.
8. Add Sociosphere integration notes mapping `TaskContract`, `CapabilityGrant`, `ProviderReceipt`, and `ReconciliationResult` into the governance graph.
