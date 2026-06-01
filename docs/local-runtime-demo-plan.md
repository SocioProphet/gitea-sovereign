# Local Runtime Demo Plan Scaffold

## Status

Planning scaffold only.

## Purpose

This document defines the gate plan for a future end-to-end local runtime demo.

The existing local MVP demo is deterministic scaffold code. A future local runtime demo may exercise runtime bindings only after their contracts and disabled defaults are in place.

## Required blockers before implementation

The runtime demo implementation must not start until all of the following are true:

1. runtime config schema exists and defaults to disabled;
2. runtime adapter contract exists;
3. upstream reference binding contract exists;
4. ledger export binding contract exists;
5. `model-governance-ledger` consumer contract exists;
6. Git transport remains disabled or has an approved enforcement design;
7. audit-chain verification is mandatory before export;
8. local scaffold behavior remains available as fallback.

## Planned demo sequence

A future local runtime demo should prove:

1. load runtime config;
2. confirm enabled runtime mode explicitly;
3. start or connect to internal-only local Gitea topology;
4. evaluate request path boundary;
5. resolve upstream references through reviewed bindings;
6. verify local grant and request coverage;
7. perform adapter-mediated source-control operation;
8. append audit events;
9. verify audit chain;
10. construct export batch;
11. submit export only to a compatible ledger consumer;
12. verify acknowledgement;
13. emit evidence-shaped demo result.

## Required disabled behavior

When runtime mode is disabled, the demo runner must:

- refuse runtime execution;
- preserve local MVP demo execution;
- avoid all live bindings;
- return a fail-closed reason;
- produce no infrastructure mutation.

## Required evidence result

A future runtime demo must return:

- runtime mode;
- request digest;
- path decision;
- reference decision;
- grant verification;
- request coverage decision;
- adapter operation status;
- audit verification;
- export batch hash;
- acknowledgement hash;
- failure reason when stopped.

## Explicit non-goals for this scaffold

- no runtime demo implementation;
- no live Gitea calls;
- no live upstream calls;
- no live ledger calls;
- no deployment;
- no infrastructure mutation;
- no Git transport enablement.
