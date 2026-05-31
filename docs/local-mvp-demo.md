# Local MVP Demo

The local MVP demo composes the substrate primitives merged through PR-G using deterministic local code only.

## Scope

The demo proves local composition:

1. request evaluation;
2. safe path handling;
3. local reference resolution;
4. local scoped grant issue and verification;
5. nonce replay rejection;
6. audit event append and chain verification;
7. receipt hash surface;
8. export batch construction and verification;
9. local acknowledgement surface.

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
  "replay_verification": "nonce.reused",
  "audit_verification": "audit.verified",
  "export_verification": "batch.verified"
}
```

## Required invariant

Audit verification must pass before export batch creation. The demo throws if audit verification fails.

## Non-goals

- no external service calls;
- no production deployment;
- no infrastructure mutation;
- no transient source material in returned demo output.
