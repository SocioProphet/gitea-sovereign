# Governance Projection Boundary

This directory is reserved for substrate-local governance projections.

These files are not canonical authority:

- agent registration cache is a projection of `SocioProphet/agent-registry`;
- policy decisions are resolved from `SocioProphet/policy-fabric`;
- grant decisions are resolved from `SocioProphet/mcp-a2a-zero-trust`;
- execution admission/evidence is coordinated with `SocioProphet/agentplane`;
- receipt export targets `SocioProphet/model-governance-ledger`.

Runtime scripts are intentionally omitted from PR-A. Later PRs must add scripts behind semantic validators and negative-path tests.
