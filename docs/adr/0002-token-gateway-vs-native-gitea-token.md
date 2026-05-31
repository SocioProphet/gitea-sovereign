# ADR-0002: SocioProphet Token Gateway vs Native Gitea Token

## Status

Accepted for PR-A scaffold.

## Context

Gitea native API tokens do not encode SocioProphet intent, device, grant, path, policy, nonce, or audit-chain semantics. Exposing native Gitea tokens directly to agents would bypass the estate control plane.

## Decision

Agents present `X-SP-Token` to the SocioProphet gateway. The gateway validates SocioProphet authority and forwards to Gitea using internal native token material. Raw native tokens are never persisted and are never exposed to agents.

## Consequences

- `X-SP-Token` is not a native Gitea token.
- Gateway mediation is mandatory for agent write paths.
- Native token lifecycle is audited by hash/receipt only.
- Direct Gitea access must be blocked by network and transport controls before runtime deployment.
