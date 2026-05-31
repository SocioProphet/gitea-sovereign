# ADR-0003: Audit Chain and Receipt Export

## Status

Accepted for PR-A scaffold.

## Context

Local SQLite append-only audit is useful for node-local durability, but it is not the canonical evidence ledger. Export needs to be idempotent and replayable.

## Decision

Local audit events are chained by sequence, previous hash, event hash, key id, and signature. Exports use receipt batches with `export_batch_id`, `first_seq`, `last_seq`, `batch_hash`, `destination_ref`, and acknowledgement fields.

## Consequences

- `export_cursor` alone is not sufficient.
- Receipt export batches are first-class schema objects.
- The model-governance-ledger consumer must validate idempotency and chain continuity.
- Audit truncation and duplicate export become detectable conditions.
