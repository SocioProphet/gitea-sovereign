# Backlog

## PR-A cleanup

- [x] Add package metadata.
- [x] Add validation workflow.
- [x] Add gitignore.
- [x] Add expanded attack fixtures.
- [ ] Inspect CI run after workflow is visible.
- [ ] Normalize executable bits if needed after local checkout.

## PR-B — gateway skeleton, no forwarding

- Add gateway config schema.
- Add request parser with no-network tests.
- Add path normalization library.
- Add deny-wins path matcher.
- Add policy/grant resolver interfaces with fail-closed stubs.
- Keep native Gitea forwarding disabled.

## PR-C — token and audit local core

- Add canonical JSON signing helper.
- Add nonce store.
- Add token issue/verify/revoke local implementation.
- Add audit append and verify-chain implementation.
- Add key-id based signing surface.
- Add rotation fixtures.

## PR-D — local Gitea substrate

- Add org/node docker compose.
- Pin explicit Gitea version.
- Bind native Gitea to internal-only network.
- Disable agent SSH/smart-HTTP transports unless enforced.
- Add direct-bypass smoke tests.

## PR-E — native Gitea token adapter

- Add service-account adapter.
- Create/revoke native tokens behind gateway only.
- Persist hashes/receipts only.
- Add token exfiltration negative tests.

## PR-F — upstream bindings

- Bind policy-fabric decision resolution.
- Bind mcp-a2a-zero-trust grant resolution.
- Fail closed on write operations during outage.
- Add outage and malformed-ref tests.

## PR-G — model-governance-ledger export

- Export receipt batches.
- Validate ack hash.
- Detect duplicate batch export.
- Recover partial export without double-counting.

## PR-H — local MVP demo

- Demonstrate local-only org/node Gitea.
- Demonstrate SP token lifecycle.
- Demonstrate intent-bound API-mediated commit/PR path.
- Demonstrate audit chain and receipt export batch.
- Demonstrate negative-path blocking.
