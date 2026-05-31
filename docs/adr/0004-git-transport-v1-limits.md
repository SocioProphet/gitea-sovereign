# ADR-0004: Git Transport v1 Limits

## Status

Accepted for PR-A scaffold.

## Context

REST API operations can be mapped to SocioProphet policy checks more easily than raw Git transports. SSH Git and smart HTTP Git require ref, commit, packfile, changed-path, and branch-protection validation before accepting writes.

## Decision

v1 write support is limited to API-mediated writes through the gateway. Agent SSH Git and direct smart HTTP Git are disabled until equivalent enforcement exists.

## Consequences

- This avoids an early bypass channel.
- The first runtime implementation can focus on deterministic REST/API validation.
- Future Git transport support requires a dedicated ADR and pre-receive/gateway validation design.
