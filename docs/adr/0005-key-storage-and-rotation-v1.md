# ADR-0005: Key Storage and Rotation v1

## Status

Accepted for PR-A scaffold.

## Context

v1 cannot depend on HSM infrastructure, but it must avoid collapsing all cryptographic authority into one undifferentiated secret.

## Decision

v1 uses local encrypted key material with separate logical keys for token signing, audit-chain signing, native Gitea service-account storage, and receipt-export signing. Each signed object carries `key_id`. HS256 is permitted for bootstrap only; Ed25519 is reserved as the preferred upgrade path.

## Consequences

- Key rotation tests are required before runtime token issuance.
- Old audit chains must remain verifiable after rotation.
- Raw native Gitea tokens are never persisted.
- HSM or hardware-backed signing remains the v2 target.
