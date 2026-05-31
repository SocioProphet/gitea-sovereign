# ADR-0006: Runtime Binding Gates

## Status

Accepted for post-local-MVP hardening.

## Context

The repository now has a local, deterministic source-control substrate MVP. The local MVP proves composition of boundary checks, local references, local grant verification, audit-chain verification, receipt construction, export batch construction, and acknowledgement surfaces.

The local MVP is not production runtime. It does not call live Gitea, live upstream authority services, or live ledger services.

## Decision

Any runtime binding must land behind an explicit reviewed runtime-mode gate.

Runtime bindings include:

- native Gitea API calls;
- live source-control write operations;
- live upstream reference resolution;
- live receipt export to the ledger target;
- transport-level Git operation support;
- production deployment manifests.

Each runtime binding PR must include:

1. an explicit runtime-mode configuration flag;
2. fail-closed behavior for unavailable dependencies;
3. audit-chain event coverage;
4. receipt or evidence output;
5. negative-path tests;
6. no raw sensitive material in returned values, persisted state, or logs;
7. local scaffold behavior preserved.

## Required order

1. Runtime-mode configuration schema.
2. Gitea runtime adapter with internal-only topology preserved.
3. Upstream reference bindings.
4. Ledger export binding.
5. End-to-end local runtime demo.
6. Production deployment review.

## Consequences

- Local scaffold code remains the default safety baseline.
- Runtime work cannot silently replace local fail-closed behavior.
- Transport support remains disabled unless an enforcement design lands first.
- The project must continue to separate source-control substrate ownership from policy, grant, topology, execution, and ledger ownership.
