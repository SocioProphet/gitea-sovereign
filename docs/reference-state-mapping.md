# Reference State Mapping

PR-F uses neutral local resolver states so the source-control substrate can remain independent from upstream implementations until runtime binding exists.

## Local to upstream mapping

| Local state | Upstream meaning | Local posture |
|---|---|---|
| `ok` | valid and current upstream reference | may continue if all other checks pass |
| `block` | upstream reference does not permit continuation | stop locally |
| `stale` | expired, superseded, or otherwise no longer current upstream reference | stop locally |
| `unknown` | unresolved, unavailable, missing, or indeterminate upstream reference | stop locally for write-class operations |

## Binding rule

When upstream bindings are introduced, their native outcomes must map into this local state machine before source-control action evaluation.

## Non-goal

This document does not define upstream semantics. It only defines the local compatibility layer used by `gitea-sovereign`.
