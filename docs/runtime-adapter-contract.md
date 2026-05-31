# Runtime Adapter Contract Scaffold

## Status

Design scaffold only.

## Purpose

This document defines the contract that a future local Gitea runtime adapter must satisfy before any runtime behavior is added.

## Current posture

The repository currently supports local deterministic scaffold behavior. The runtime configuration schema exists, but the disabled fixture keeps all runtime bindings disabled.

This document does not enable runtime behavior.

## Adapter boundary

A future adapter must remain behind:

- `schemas/runtime-config.schema.json`;
- ADR-0006 runtime binding gates;
- local audit-chain verification;
- receipt/evidence output requirements;
- no raw transient material in returned values, persisted state, or logs.

## Required adapter phases

1. Contract scaffold and disabled tests.
2. Local runtime client interface with no network implementation.
3. Internal-only local Gitea client binding.
4. Negative-path tests for unavailable service, rejected response, stale reference, and malformed operation.
5. Audit-chain and receipt integration.
6. End-to-end local runtime demo.

## Required adapter inputs

A future runtime adapter must receive:

- runtime config;
- request object;
- verified local grant;
- reference decision;
- audit chain handle;
- receipt sink.

## Required adapter outputs

A future runtime adapter must return evidence-shaped data only:

- operation status;
- operation digest;
- receipt hash;
- audit event reference;
- failure reason if fail-closed.

## Explicit non-goals for this scaffold

- no live Gitea calls;
- no token creation;
- no source-control write operation;
- no deployment;
- no infrastructure mutation;
- no Git transport enablement.
