# Canonicalization Posture

## Status

Bootstrap local scaffold only.

## Current implementation

`core/canonical.js` provides deterministic serialization for the local MVP scaffold. It supports:

- `null`;
- strings normalized to NFC;
- finite numbers;
- booleans;
- arrays;
- objects with lexicographically sorted keys;
- omission of object properties whose value is `undefined`.

It also provides local SHA-256 and HMAC-SHA256 helpers used by tests and scaffold receipts.

## Boundary

This is not a production canonical JSON standard. It is not claimed to be a complete RFC 8785 implementation.

The current helper is acceptable only for deterministic local test vectors and scaffold receipts. Runtime binding work must either:

1. replace it with a vetted RFC 8785-compatible implementation; or
2. formally define a SocioProphet canonical serialization profile with cross-language test vectors.

## Required runtime gate

Before runtime-mode signing is permitted, the project must add:

- canonicalization test vectors;
- cross-runtime compatibility checks;
- numeric edge-case policy;
- Unicode normalization policy;
- explicit unsupported-value handling;
- key-rotation compatibility tests.

## Non-goals

This document does not define production cryptography, key storage, hardware-backed signing, or cross-node signing policy.
