# Production Deployment Review Scaffold

## Status

Review scaffold only.

## Purpose

This document defines the production deployment review gates required before `gitea-sovereign` can ship production deployment artifacts or enable production runtime behavior.

## Current posture

The repository has a local scaffold and runtime planning contracts. It does not have production deployment approval.

No production deployment manifests, hosted services, infrastructure mutations, or public endpoints are enabled by this scaffold.

## Required review gates

Production deployment work must not start until all of the following are complete:

1. runtime configuration schema is present and defaults to disabled;
2. runtime adapter implementation has passed negative-path tests;
3. upstream reference binding contracts are implemented against owning systems;
4. ledger consumer contract is implemented in `model-governance-ledger`;
5. local runtime demo has passed with audit-before-export enforced;
6. Git transport is disabled or covered by an approved enforcement design;
7. canonicalization and signing posture is production-grade;
8. secret storage and key rotation are reviewed;
9. dependency outage behavior fails closed;
10. rollback and incident-response procedures exist;
11. observability emits evidence without raw sensitive material;
12. Sociosphere and Prophet Platform integration contracts are reviewed.

## Required production review artifacts

A production deployment review must include:

- threat model update;
- data-flow diagram;
- trust-boundary diagram;
- dependency inventory;
- secret and key-management plan;
- evidence and audit retention plan;
- rollback plan;
- incident-response runbook;
- deployment topology;
- operational readiness checklist;
- sign-off record.

## Explicit non-goals for this scaffold

- no production deployment;
- no deployment manifests;
- no hosted service creation;
- no infrastructure mutation;
- no public endpoint exposure;
- no transport enablement;
- no runtime behavior changes.
