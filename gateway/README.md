# Gateway Scaffold

This directory is reserved for the SocioProphet source-control gateway.

PR-A intentionally does not implement live forwarding, native Gitea token creation, or runtime authorization. The gateway runtime must not land until the following are reviewed:

1. transport boundary and direct-bypass controls;
2. key hierarchy and rotation behavior;
3. audit-chain append and verification behavior;
4. policy-fabric decision resolution;
5. mcp-a2a-zero-trust grant resolution;
6. TOCTOU checks for branch base/head state;
7. negative-path tests for replay, path traversal, scope expansion, and direct Gitea access.

## Planned v1 request posture

Agents submit `X-SP-Token` to the gateway. The gateway validates SocioProphet authority and forwards to Gitea using internal native token material. Agents never receive raw native Gitea credentials.
