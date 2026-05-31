# Authority Boundaries

`gitea-sovereign` is the L0 source-control substrate. It owns deployable Gitea substrate profiles, org/node bootstrap shape, the source-control token-enforcement gateway boundary, substrate-local projections, source-control receipts, and the source-control trust-root binding.

It does not own canonical agent identity, grant semantics, policy language, execution admission, evidence-ledger authority, platform runtime APIs, or estate topology. Those authorities remain delegated upstream.

## Canonical authority map

| Concern | Canonical owner | Local posture |
|---|---|---|
| Agent identity, sessions, runtime authority | `SocioProphet/agent-registry` | cache/projection only |
| Grants, revocation, trust tiers, protocol authority | `SocioProphet/mcp-a2a-zero-trust` | consume grant decisions |
| Policy language and enforcement semantics | `SocioProphet/policy-fabric` | consume policy decision refs |
| Execution admission and evidence-producing runs | `SocioProphet/agentplane` | register source-control intent/evidence bridge |
| Runtime deployment and platform API | `SocioProphet/prophet-platform` | expose deployable substrate contract |
| Estate graph/topology | `SocioProphet/sociosphere` | publish service graph edge |
| Evidence/receipt ledger | `SocioProphet/model-governance-ledger` | export source-control receipt batches |

## Non-negotiable invariant

The repository may bootstrap local control files, but those files are never canonical authority unless a later ADR explicitly transfers ownership and all upstream references are updated.
