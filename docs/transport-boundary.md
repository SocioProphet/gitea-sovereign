# Transport Boundary

PR-A makes a conservative transport decision:

1. Agent writes are not allowed to bypass the SocioProphet gateway.
2. Native Gitea tokens are internal implementation details held by the gateway, not client credentials.
3. Direct client access to Gitea REST, smart HTTP Git, or SSH Git is out of scope for v1 until equivalent enforcement is implemented.
4. API-mediated writes are the only planned v1 write path.

## Direct-bypass controls required before runtime

The runtime implementation must ensure:

- Gitea binds to an internal network address only.
- The public/agent-facing endpoint is the SP gateway.
- SSH Git is disabled for agent flows unless a governed SSH/pre-receive enforcement path exists.
- Smart HTTP Git is disabled for agent flows unless gateway validation covers refs, commits, changed paths, and branch protection.
- Admin UI access is isolated from agent networks.

## TOCTOU rule

Every write, merge, tag, or branch mutation must re-check `base_ref` and `expected_head` immediately before the native Gitea operation. If the branch moved after approval, the request fails closed and requires a new intent.

## Refresh wording

Token refresh is transparent to the agent, but never silent to the system. Each refresh emits `token.refresh`, revalidates policy and grant refs, consumes a fresh nonce, preserves the original intent hash, and cannot expand scope.
