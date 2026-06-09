'use strict';
/**
 * required-files — presence check for every scaffold artifact.
 */
const fs = require('fs');
const path = require('path');

const REQUIRED_FILES = [
  'package.json',
  '.gitignore',
  '.github/workflows/validate.yml',
  'schemas/token.schema.json',
  'schemas/intent.schema.json',
  'schemas/audit-event.schema.json',
  'schemas/agent-registration.schema.json',
  'schemas/receipt-export.schema.json',
  'schemas/control-config.schema.json',
  'schemas/runtime-config.schema.json',
  'schemas/capability-grant.schema.json',
  'schemas/provider-receipt.schema.json',
  'schemas/reconciliation-result.schema.json',
  'gateway/control-boundary.js',
  'core/canonical.js',
  'core/nonce-store.js',
  'core/local-authority.js',
  'core/audit-chain.js',
  'core/native-adapter.js',
  'core/reference-resolver.js',
  'core/receipt-export.js',
  'demo/local-mvp.js',
  'deploy/local/docker-compose.yml',
  'test/control-boundary.test.js',
  'test/local-core.test.js',
  'test/local-substrate.test.js',
  'test/native-adapter.test.js',
  'test/reference-resolver.test.js',
  'test/receipt-export.test.js',
  'test/local-mvp.test.js',
  'test/runtime-config.test.js',
  'test/runtime-adapter-contract.test.js',
  'test/upstream-reference-binding-contract.test.js',
  'test/ledger-export-binding-contract.test.js',
  'test/local-runtime-demo-plan.test.js',
  'test/production-deployment-review.test.js',
  'docs/authority-boundaries.md',
  'docs/transport-boundary.md',
  'docs/threat-model.md',
  'docs/backlog.md',
  'docs/local-substrate-topology.md',
  'docs/reference-state-mapping.md',
  'docs/local-mvp-demo.md',
  'docs/canonicalization.md',
  'docs/path-boundary.md',
  'docs/runtime-adapter-contract.md',
  'docs/upstream-reference-binding-contract.md',
  'docs/ledger-export-binding-contract.md',
  'docs/local-runtime-demo-plan.md',
  'docs/registered-agent-control-plane-integration.md',
  'docs/registered-agent-validation-matrix.md',
  'docs/validation.md',
  'docs/production-deployment-review.md',
  'docs/adr/0001-authority-boundaries.md',
  'docs/adr/0002-token-gateway-vs-native-gitea-token.md',
  'docs/adr/0003-audit-chain-and-export.md',
  'docs/adr/0004-git-transport-v1-limits.md',
  'docs/adr/0005-key-storage-and-rotation-v1.md',
  'docs/adr/0006-runtime-binding-gates.md',
  'examples/valid/token.example.json',
  'examples/valid/intent.example.json',
  'examples/valid/runtime-config.disabled.example.json',
  'examples/valid/runtime-adapter.disabled.example.json',
  'examples/valid/upstream-reference-binding.disabled.example.json',
  'examples/valid/ledger-export-binding.disabled.example.json',
  'examples/valid/local-runtime-demo.disabled.example.json',
  'examples/valid/production-deployment-review.blocked.example.json',
  'examples/valid-capability-grant.json',
  'examples/valid-provider-receipt.json',
  'examples/valid-reconciliation-result.json',
  'examples/invalid-capability-missing-reconciliation.json',
  'examples/invalid-capability-multi-use-write.json',
  'examples/invalid-false-completion-missing-reconciliation.json',
  'examples/attacks/replay-nonce.attack.json',
  'examples/attacks/path-traversal.attack.json',
  'examples/attacks/direct-gitea-bypass.attack.json',
  'examples/attacks/scope-widening.attack.json',
  'examples/attacks/mutated-intent.attack.json',
  'examples/attacks/stale-base-ref.case.json',
  'examples/attacks/moved-expected-head.case.json',
  'examples/attacks/forged-receipt.case.json',
  'examples/attacks/reordered-audit-seq.case.json',
  'examples/attacks/policy-outage.case.json',
  'examples/attacks/grant-outage.case.json',
  'examples/attacks/url-encoded-traversal.case.json',
];

module.exports = function validateRequiredFiles({ ROOT, readJson, fail, pass }) {
  for (const rel of REQUIRED_FILES) {
    if (!fs.existsSync(path.join(ROOT, rel))) fail(`missing required scaffold file: ${rel}`);
    else pass(`found ${rel}`);
  }

  // All schema files must be valid closed JSON schemas
  for (const rel of REQUIRED_FILES.filter((f) => f.endsWith('.json') && f.startsWith('schemas/'))) {
    const doc = readJson(rel);
    if (!doc) continue;
    if (doc.type !== 'object') fail(`${rel} must define an object root`);
    if (doc.additionalProperties !== false) fail(`${rel} must fail closed with additionalProperties=false`);
    if (!Array.isArray(doc.required) || doc.required.length === 0) fail(`${rel} must define required fields`);
  }

  // All example JSON files must parse
  for (const rel of REQUIRED_FILES.filter((f) => f.endsWith('.json') && f.startsWith('examples/'))) {
    readJson(rel);
  }
};
