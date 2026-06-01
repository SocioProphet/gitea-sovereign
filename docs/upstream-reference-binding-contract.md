# Upstream Reference Binding Contract Scaffold

## Status

Planning scaffold only.

## Purpose

This document defines the compatibility contract required before local reference resolution can bind to upstream authority systems.

## Current posture

`core/reference-resolver.js` uses local states:

- `ok`;
- `block`;
- `stale`;
- `unknown`.

These states are local compatibility states. They are not upstream policy language and they do not replace the owning systems.

## Owning systems

Future bindings must treat the following systems as external authorities:

- Policy Fabric for policy decision semantics;
- MCP/A2A Zero Trust for grant, revocation, and protocol trust semantics.

`gitea-sovereign` remains the source-control substrate. It must not become the policy engine, grant engine, or protocol authority.

## Required upstream contract inputs

A future binding must receive:

- runtime config;
- local request object;
- local reference ids;
- current branch/ref context;
- local audit chain handle;
- timeout and retry policy;
- dependency health state.

## Required upstream contract outputs

A future binding must map upstream outcomes into the local states:

| Local state | Required meaning |
|---|---|
| `ok` | upstream reference is current and permits local continuation |
| `block` | upstream reference explicitly stops local continuation |
| `stale` | upstream reference is expired, revoked, superseded, or no longer current |
| `unknown` | upstream reference cannot be resolved or dependency state is indeterminate |

## Fail-closed requirements

The binding must return `unknown` or `block` for:

- unavailable dependency;
- timeout;
- malformed upstream response;
- missing decision id;
- stale cache;
- signature or integrity mismatch;
- unsupported upstream version.

Write-class operations must stop on `unknown`.

## Required evidence

A future binding must emit evidence-shaped data:

- upstream system id;
- upstream reference id;
- mapped local state;
- decision digest;
- dependency health summary;
- audit event reference;
- failure reason when stopped.

## Explicit non-goals for this scaffold

- no live upstream calls;
- no policy language implementation;
- no grant authority implementation;
- no protocol authority implementation;
- no deployment;
- no infrastructure mutation.
