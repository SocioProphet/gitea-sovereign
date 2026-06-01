# Ledger Export Binding Contract Scaffold

## Status

Planning scaffold only.

## Purpose

This document defines the producer-side contract required before `gitea-sovereign` can bind its receipt export path to `model-governance-ledger`.

## Ownership boundary

`gitea-sovereign` is the source-control substrate and receipt producer.

`model-governance-ledger` is the canonical evidence and receipt consumer authority.

The producer must not become the ledger authority. The ledger must not become the source-control authority.

## Export path

```text
Audit log -> export cursor -> model-governance-ledger
```

## Current local producer artifacts

- `schemas/receipt-export.schema.json`;
- `core/receipt-export.js`;
- `test/receipt-export.test.js`;
- `docs/adr/0003-audit-chain-and-export.md`;
- `docs/adr/0006-runtime-binding-gates.md`.

## Blocking consumer issue

Live binding is blocked until the consumer side exists:

```text
SocioProphet/model-governance-ledger#24
```

## Required producer binding inputs

A future producer-side binding must receive:

- runtime config;
- verified audit chain;
- export cursor state;
- contiguous event range;
- destination reference;
- consumer contract reference;
- timeout and retry policy;
- dependency health state.

## Required producer binding outputs

A future producer-side binding must return evidence-shaped data only:

- export batch id;
- first sequence;
- last sequence;
- batch hash;
- destination reference;
- acknowledgement hash;
- audit event reference;
- failure reason when stopped.

## Fail-closed requirements

The producer binding must stop for:

- missing consumer contract;
- dependency unavailable;
- timeout;
- malformed acknowledgement;
- acknowledgement hash mismatch;
- unsupported consumer version;
- sequence gap;
- audit-chain verification failure;
- duplicate batch rejection.

## Runtime invariant

Audit-chain verification must pass before export batch construction and before live submission.

## Explicit non-goals for this scaffold

- no live ledger calls;
- no ledger storage implementation;
- no source-control authority transfer;
- no deployment;
- no infrastructure mutation.
