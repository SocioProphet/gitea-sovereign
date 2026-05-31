# Local MVP Demo

The local MVP demo composes the substrate primitives merged through PR-G using deterministic local code only.

## Scope

The demo proves local composition:

1. request evaluation;
2. safe path handling;
3. local reference resolution;
4. local scoped grant issue and verification;
5. request containment inside verified grant scope;
6. nonce replay rejection;
7. audit event append and chain verification;
8. receipt hash surface;
9. export batch construction and verification;
10. local acknowledgement surface.

## Command

```bash
node demo/local-mvp.js
```

## Expected posture

The result includes:

```json
{
  "live_calls": false,
  "path_decision": "request.allowed",
  "reference_decision": "references.ok",
  "grant_verification": "grant.verified",
  "scope_decision": "scope.allowed",
  "replay_verification": "nonce.reused",
  "audit_verification": "audit.verified",
  "export_verification": "batch.verified"
}
```

## Required invariants

Grant verification proves the local grant object is signed, unexpired, and nonce-bound. Scope containment separately proves the request repo, branch, and operation are inside the verified grant scope.

Audit verification must pass before export batch creation. The demo throws if audit verification fails.

## Non-goals

- no external service calls;
- no production deployment;
- no infrastructure mutation;
- no transient source material in returned demo output.
