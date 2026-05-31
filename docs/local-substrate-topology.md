# Local Substrate Topology

This document defines the PR-D local-only source-control substrate topology.

## Scope

PR-D introduces a local compose topology for org/node Gitea instances. It does not introduce native token adapters, external service calls, production deployment, federation, or infrastructure mutation.

## Version pin

The local scaffold pins Gitea to:

```text
1.26.2-rootless
```

The image pin must remain explicit. Floating `latest` tags are not allowed.

## Network posture

The local compose file uses an internal-only Docker network named `source_control_internal`.

Native Gitea services use `expose`, not host `ports`. This means the local substrate is reachable to sibling services on the internal network, but not directly published to the host network by the compose file.

## Transport posture

Agent-facing SSH and direct smart-HTTP flows remain out of scope.

The local Gitea services set:

```text
GITEA__server__DISABLE_SSH=true
GITEA__server__START_SSH_SERVER=false
```

Future runtime work must keep agent-facing access mediated by the SocioProphet control boundary until an explicit transport enforcement ADR exists.

## Bootstrap posture

Registration is disabled and install lock is enabled in the scaffold environment. PR-D does not create users, repositories, tokens, or credentials.

## Non-goals

- no native Gitea token creation;
- no production deployment;
- no external policy/grant binding;
- no receipt export implementation;
- no cross-node federation.
