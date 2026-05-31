# Architecture Scaffold

`gitea-sovereign` provides the L0 source-control substrate for SocioProphet.

## Planned v1 topology

```text
agent
  -> SP gateway
  -> internal native Gitea API
  -> local audit chain
  -> receipt export batch
  -> model-governance-ledger
```

## Control dependencies

```text
agent-registry              -> identity/cache source
mcp-a2a-zero-trust          -> grant decision source
policy-fabric               -> policy decision source
agentplane                  -> execution admission/evidence bridge
prophet-platform            -> runtime deployment/API contract
sociosphere                 -> estate topology source of truth
model-governance-ledger     -> receipt/evidence ledger target
```

## PR-A scope

PR-A creates docs, schemas, examples, ADRs, and validation surfaces only. It does not create a running Gitea instance, issue tokens, create native Gitea credentials, or mutate infrastructure.
