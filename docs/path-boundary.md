# Path Boundary Semantics

## Status

Accepted for local scaffold and future runtime gate.

## Principle

Authorization-path handling must fail closed. The boundary does not perform user-friendly path cleanup before deciding whether a source-control request is covered.

## Current local behavior

`gateway/control-boundary.js` rejects paths that contain:

- malformed percent encoding;
- control characters;
- absolute path forms;
- Windows-drive-style prefixes;
- repeated separators;
- `.` path segments;
- `..` path segments.

URL decoding happens before segment checks.

Unicode strings are normalized to NFC before evaluation. NFC normalization is not a full confusable-character defense.

## Deny-wins rule

Deny patterns are evaluated before allow patterns. A path matched by both sets is denied.

## What this layer does not prove

The local scaffold does not yet prove:

- repository object existence;
- symlink target safety;
- changed-path extraction from a real commit;
- branch head freshness;
- packfile contents;
- smart HTTP or SSH Git transport enforcement.

Those checks belong to later runtime-binding work.

## Runtime gate

Before live write operations are permitted, runtime work must add:

- changed-path extraction;
- branch/head freshness checks;
- ref protection checks;
- transport-specific enforcement or explicit transport disablement;
- Unicode confusable policy;
- regression fixtures for encoded and platform-specific path forms.
