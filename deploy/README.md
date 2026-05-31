# Deploy Scaffold

Deployment assets are intentionally scaffolded in PR-A.

The first runtime deployment PR must prove:

- Gitea is pinned to an explicit tested version;
- Gitea binds to an internal-only network for agent flows;
- public agent ingress terminates at the SP gateway;
- direct SSH Git is disabled unless governed transport enforcement exists;
- smart HTTP Git is disabled unless governed transport enforcement exists;
- admin UI access is isolated from agent networks;
- smoke tests prove direct-bypass attempts fail.
