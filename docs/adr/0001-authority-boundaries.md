# ADR-0001: Authority Boundaries

## Status

Accepted for PR-A scaffold.

## Context

The source-control substrate requires local bootstrap state, but the broader SocioProphet estate already has canonical owners for identity, grants, policy, execution, runtime APIs, topology, and ledger authority.

## Decision

`gitea-sovereign` owns only the L0 source-control substrate and local source-control projections. It consumes canonical authority from upstream repositories and emits source-control receipts outward.

## Consequences

- Local registry files are bootstrap caches only.
- Policy decisions are referenced, not authored, here.
- Grant decisions are referenced, not authored, here.
- Runtime deployment contracts remain platform-owned.
- Sociosphere remains the estate topology source of truth.
